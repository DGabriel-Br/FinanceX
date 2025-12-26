import { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, AlertCircle, Plus, Check, Eye, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory, incomeCategoryLabels, expenseCategoryLabels } from '@/types/transaction';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomCategory } from '@/hooks/useCustomCategories';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface ExcelImportExportProps {
  transactions: Transaction[];
  onImport: (transactions: Array<{ type: TransactionType; category: string; date: string; description: string; value: number }>) => Promise<void>;
  customCategories?: CustomCategory[];
  onCreateCategories?: (categories: Array<{ name: string; type: 'receita' | 'despesa' }>) => Promise<boolean>;
}

interface UnknownCategory {
  name: string;
  type: TransactionType;
  selected: boolean;
}

interface ParsedTransaction {
  type: TransactionType;
  category: string;
  categoryLabel: string;
  categoryIsCustom: boolean;
  categoryIsNew: boolean;
  date: string;
  description: string;
  value: number;
}

type ImportStep = 'upload' | 'preview' | 'categories';

// Mapas inversos para importação
const incomeCategoryKeysMap: Record<string, TransactionCategory> = {
  'salário': 'salario',
  'salario': 'salario',
  '13º salário': '13_salario',
  '13 salário': '13_salario',
  '13_salario': '13_salario',
  'férias': 'ferias',
  'ferias': 'ferias',
  'freelance': 'freelance',
  'outros': 'outros_receita',
  'outros_receita': 'outros_receita',
};

const expenseCategoryKeysMap: Record<string, TransactionCategory> = {
  'contas fixas mensais': 'contas_fixas',
  'contas fixas': 'contas_fixas',
  'contas_fixas': 'contas_fixas',
  'investimentos': 'investimentos',
  'dívidas': 'dividas',
  'dividas': 'dividas',
  'educação': 'educacao',
  'educacao': 'educacao',
  'transporte': 'transporte',
  'mercado': 'mercado',
  'delivery': 'delivery',
  'outros': 'outros_despesa',
  'outros_despesa': 'outros_despesa',
};

export const ExcelImportExport = ({ 
  transactions, 
  onImport,
  customCategories = [],
  onCreateCategories
}: ExcelImportExportProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [unknownCategories, setUnknownCategories] = useState<UnknownCategory[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<ParsedTransaction[]>([]);
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryLabel = (category: TransactionCategory | string, type: TransactionType): string => {
    if (type === 'receita') {
      return incomeCategoryLabels[category as keyof typeof incomeCategoryLabels] || category;
    }
    return expenseCategoryLabels[category as keyof typeof expenseCategoryLabels] || category;
  };

  const previewSummary = useMemo(() => {
    const income = pendingTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
    const expense = pendingTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
    const newCategories = unknownCategories.length;
    return { income, expense, total: pendingTransactions.length, newCategories };
  }, [pendingTransactions, unknownCategories]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const isNativePlatform = (): boolean => {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  };

  const exportToExcel = async () => {
    if (transactions.length === 0) {
      toast.error('Não há lançamentos para exportar');
      return;
    }

    const data = transactions.map(t => ({
      'Tipo': t.type === 'receita' ? 'Receita' : 'Despesa',
      'Categoria': getCategoryLabel(t.category, t.type),
      'Data': t.date,
      'Descrição': t.description,
      'Valor': t.value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lançamentos');

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 12 },
      { wch: 40 },
      { wch: 15 },
    ];

    const fileName = `lancamentos_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Verificar se está no app nativo
    if (isNativePlatform()) {
      try {
        // Gerar o arquivo como base64
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
        
        // Salvar o arquivo no dispositivo
        const result = await Filesystem.writeFile({
          path: fileName,
          data: wbout,
          directory: Directory.Documents,
        });

        // Compartilhar o arquivo (permite ao usuário escolher onde salvar/enviar)
        await Share.share({
          title: 'Exportar Lançamentos',
          text: 'Lançamentos exportados do FinanceX',
          url: result.uri,
          dialogTitle: 'Salvar ou compartilhar arquivo',
        });

        toast.success(`Arquivo "${fileName}" exportado com sucesso!`);
      } catch (error: any) {
        console.error('Erro ao exportar no app nativo:', error);
        // Se o usuário cancelou o compartilhamento, não mostrar erro
        if (error?.message?.includes('cancel')) {
          return;
        }
        toast.error('Erro ao exportar arquivo. Tente novamente.');
      }
    } else {
      // Navegador web - usar método padrão
      XLSX.writeFile(workbook, fileName);
      toast.success('Lançamentos exportados com sucesso!');
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Tipo': 'Receita',
        'Categoria': 'Salário',
        'Data': '2024-01-15',
        'Descrição': 'Exemplo de receita',
        'Valor': 5000.00,
      },
      {
        'Tipo': 'Despesa',
        'Categoria': 'Mercado',
        'Data': '2024-01-16',
        'Descrição': 'Exemplo de despesa',
        'Valor': 350.50,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 12 },
      { wch: 40 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, 'modelo_lancamentos.xlsx');
    toast.success('Modelo baixado com sucesso!');
  };

  const parseCategory = (categoryStr: string, type: TransactionType): { key: string | null; isCustom: boolean; label: string } => {
    const normalized = categoryStr.toLowerCase().trim();
    
    // Verificar categorias padrão
    if (type === 'receita') {
      const defaultKey = incomeCategoryKeysMap[normalized];
      if (defaultKey) return { key: defaultKey, isCustom: false, label: incomeCategoryLabels[defaultKey as keyof typeof incomeCategoryLabels] || categoryStr };
    } else {
      const defaultKey = expenseCategoryKeysMap[normalized];
      if (defaultKey) return { key: defaultKey, isCustom: false, label: expenseCategoryLabels[defaultKey as keyof typeof expenseCategoryLabels] || categoryStr };
    }
    
    // Verificar categorias personalizadas existentes
    const existingCustom = customCategories.find(
      c => c.name.toLowerCase() === normalized && c.type === type
    );
    if (existingCustom) {
      return { key: `custom_${existingCustom.id}`, isCustom: true, label: existingCustom.name };
    }
    
    return { key: null, isCustom: false, label: categoryStr };
  };

  const parseDate = (dateValue: unknown): string | null => {
    if (!dateValue) return null;

    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return date.toISOString().split('T')[0];
    }

    if (typeof dateValue === 'string') {
      const str = dateValue.trim();
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      
      const brMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (brMatch) {
        return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
      }
    }

    return null;
  };

  const resetImport = () => {
    setCurrentStep('upload');
    setImportErrors([]);
    setUnknownCategories([]);
    setPendingTransactions([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setIsImportDialogOpen(false);
    resetImport();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportErrors([]);
    setUnknownCategories([]);
    setPendingTransactions([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('O arquivo está vazio');
        setIsImporting(false);
        return;
      }

      const errors: string[] = [];
      const parsedTransactions: ParsedTransaction[] = [];
      const unknownCats: Map<string, UnknownCategory> = new Map();

      jsonData.forEach((row: unknown, index: number) => {
        const rowNum = index + 2;
        const r = row as Record<string, unknown>;

        // Validar tipo
        const typeStr = String(r['Tipo'] || '').toLowerCase().trim();
        let type: TransactionType;
        if (typeStr === 'receita') {
          type = 'receita';
        } else if (typeStr === 'despesa') {
          type = 'despesa';
        } else {
          errors.push(`Linha ${rowNum}: Tipo inválido "${r['Tipo']}". Use "Receita" ou "Despesa".`);
          return;
        }

        // Validar categoria
        const categoryStr = String(r['Categoria'] || '').trim();
        if (!categoryStr) {
          errors.push(`Linha ${rowNum}: Categoria é obrigatória.`);
          return;
        }

        const { key: categoryKey, isCustom, label } = parseCategory(categoryStr, type);

        // Validar data
        const date = parseDate(r['Data']);
        if (!date) {
          errors.push(`Linha ${rowNum}: Data inválida "${r['Data']}". Use formato YYYY-MM-DD ou DD/MM/YYYY.`);
          return;
        }

        // Validar descrição
        const description = String(r['Descrição'] || r['Descricao'] || '').trim();
        if (!description) {
          errors.push(`Linha ${rowNum}: Descrição é obrigatória.`);
          return;
        }

        // Validar valor
        let value = r['Valor'];
        if (typeof value === 'string') {
          value = parseFloat(value.replace(',', '.'));
        }
        if (typeof value !== 'number' || isNaN(value) || value <= 0) {
          errors.push(`Linha ${rowNum}: Valor inválido "${r['Valor']}".`);
          return;
        }

        // Se a categoria não existe, adicionar à lista de desconhecidas
        if (!categoryKey) {
          const catKey = `${type}:${categoryStr.toLowerCase()}`;
          if (!unknownCats.has(catKey)) {
            unknownCats.set(catKey, {
              name: categoryStr,
              type,
              selected: true
            });
          }
          parsedTransactions.push({
            type,
            category: categoryStr,
            categoryLabel: categoryStr,
            categoryIsCustom: true,
            categoryIsNew: true,
            date,
            description,
            value: Number(value),
          });
        } else {
          parsedTransactions.push({
            type,
            category: categoryKey,
            categoryLabel: label,
            categoryIsCustom: isCustom,
            categoryIsNew: false,
            date,
            description,
            value: Number(value),
          });
        }
      });

      if (errors.length > 0) {
        setImportErrors(errors);
      }

      if (parsedTransactions.length > 0) {
        setPendingTransactions(parsedTransactions);
        setUnknownCategories(Array.from(unknownCats.values()));
        setCurrentStep('preview');
      } else if (errors.length > 0) {
        toast.error('Nenhum lançamento válido encontrado');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao processar o arquivo');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleCategory = (index: number) => {
    setUnknownCategories(prev => 
      prev.map((cat, i) => i === index ? { ...cat, selected: !cat.selected } : cat)
    );
  };

  const handleProceedFromPreview = () => {
    if (unknownCategories.length > 0 && onCreateCategories) {
      setCurrentStep('categories');
    } else {
      handleConfirmImport();
    }
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    
    try {
      // Se há categorias para criar
      if (unknownCategories.length > 0 && onCreateCategories) {
        const selectedCategories = unknownCategories.filter(c => c.selected);
        
        if (selectedCategories.length > 0) {
          const success = await onCreateCategories(
            selectedCategories.map(c => ({ name: c.name, type: c.type }))
          );
          
          if (!success) {
            toast.error('Erro ao criar algumas categorias');
            setIsImporting(false);
            return;
          }
        }

        // Atualizar transações com categorias que não foram criadas para usar "outros"
        const notSelectedCategories = unknownCategories.filter(c => !c.selected);
        const updatedTransactions = pendingTransactions.map(t => {
          if (!t.categoryIsNew) return t;
          
          const isNotSelected = notSelectedCategories.some(
            c => c.name.toLowerCase() === t.category.toLowerCase() && c.type === t.type
          );
          
          if (isNotSelected) {
            return {
              ...t,
              category: t.type === 'receita' ? 'outros_receita' : 'outros_despesa'
            };
          }
          
          const wasSelected = selectedCategories.some(
            c => c.name.toLowerCase() === t.category.toLowerCase() && c.type === t.type
          );
          
          if (wasSelected) {
            return {
              ...t,
              category: `custom_new_${t.category}`
            };
          }
          
          return t;
        });

        await onImport(updatedTransactions.map(t => ({
          type: t.type,
          category: t.category,
          date: t.date,
          description: t.description,
          value: t.value,
        })));

        const totalCreated = selectedCategories.length;
        if (totalCreated > 0) {
          toast.success(`${totalCreated} categoria(s) criada(s) e ${updatedTransactions.length} lançamento(s) importado(s)!`);
        } else {
          toast.success(`${updatedTransactions.length} lançamento(s) importado(s) com sucesso!`);
        }
      } else {
        // Importar diretamente
        await onImport(pendingTransactions.map(t => ({
          type: t.type,
          category: t.category,
          date: t.date,
          description: t.description,
          value: t.value,
        })));
        toast.success(`${pendingTransactions.length} lançamento(s) importado(s) com sucesso!`);
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao processar importação:', error);
      toast.error('Erro ao processar importação');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      {/* Botão Importar */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsImportDialogOpen(true)}
        className="gap-1.5 h-8 md:h-9 px-3"
      >
        <Upload className="w-4 h-4" />
        <span className="text-xs md:text-sm">Importar</span>
      </Button>

      {/* Botão Exportar */}
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="gap-1.5 h-8 md:h-9 px-3"
      >
        <Download className="w-4 h-4" />
        <span className="text-xs md:text-sm">Exportar</span>
      </Button>

      {/* Dialog de Importação */}
      <Dialog open={isImportDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentStep === 'upload' && (
                <>
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  Importar Lançamentos
                </>
              )}
              {currentStep === 'preview' && (
                <>
                  <Eye className="w-5 h-5 text-primary" />
                  Preview da Importação
                </>
              )}
              {currentStep === 'categories' && (
                <>
                  <Plus className="w-5 h-5 text-primary" />
                  Novas Categorias
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 'upload' && 'Selecione um arquivo Excel (.xlsx) para importar lançamentos.'}
              {currentStep === 'preview' && 'Revise os lançamentos antes de importar.'}
              {currentStep === 'categories' && 'Encontramos categorias que não existem. Deseja criá-las?'}
            </DialogDescription>
          </DialogHeader>

          {/* Step: Upload */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Loading State */}
              {isImporting ? (
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-12 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    {/* Outer spinning ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                    {/* Inner icon */}
                    <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileSpreadsheet className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    Processando arquivo...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aguarde enquanto analisamos seus lançamentos
                  </p>
                  <div className="flex justify-center gap-1 mt-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Drop Zone */}
                  <div 
                    className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-base font-medium text-foreground mb-1">
                      Arraste seu arquivo ou clique para selecionar
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: .xlsx, .xls
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadTemplate}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-4 h-4" />
                      Baixar modelo de exemplo
                    </Button>
                  </div>

                  {importErrors.length > 0 && (
                    <div className="rounded-lg bg-destructive/10 p-3 max-h-40 overflow-auto animate-fade-in">
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Erros encontrados:</span>
                      </div>
                      <ul className="text-xs text-destructive space-y-1">
                        {importErrors.slice(0, 10).map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                        {importErrors.length > 10 && (
                          <li className="font-medium">...e mais {importErrors.length - 10} erro(s)</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Info */}
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground text-center">
                      <span className="text-primary">💡</span> Categorias novas serão criadas automaticamente com sua permissão
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {currentStep === 'preview' && (
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{previewSummary.total}</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3 text-center">
                  <p className="text-xs text-success flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Receitas
                  </p>
                  <p className="text-sm font-bold text-success">{formatCurrency(previewSummary.income)}</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-center">
                  <p className="text-xs text-destructive flex items-center justify-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Despesas
                  </p>
                  <p className="text-sm font-bold text-destructive">{formatCurrency(previewSummary.expense)}</p>
                </div>
                {previewSummary.newCategories > 0 && (
                  <div className="rounded-lg bg-primary/10 p-3 text-center">
                    <p className="text-xs text-primary flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" /> Novas Cat.
                    </p>
                    <p className="text-lg font-bold text-primary">{previewSummary.newCategories}</p>
                  </div>
                )}
              </div>

              {/* Transactions List */}
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="divide-y">
                  {pendingTransactions.map((t, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        t.type === 'receita' ? 'bg-success' : 'bg-destructive'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(t.date)}</span>
                          <span>•</span>
                          <span className={`${t.categoryIsNew ? 'text-primary font-medium' : ''}`}>
                            {t.categoryLabel}
                            {t.categoryIsNew && ' (nova)'}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold flex-shrink-0 ${
                        t.type === 'receita' ? 'text-success' : 'text-destructive'
                      }`}>
                        {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {importErrors.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{importErrors.length} linha(s) ignorada(s) por erros</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Categories */}
          {currentStep === 'categories' && (
            <div className="space-y-4">
              <ScrollArea className="max-h-60">
                <div className="space-y-2 pr-4">
                  {unknownCategories.map((cat, index) => (
                    <div
                      key={`${cat.type}-${cat.name}`}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`cat-${index}`}
                        checked={cat.selected}
                        onCheckedChange={() => toggleCategory(index)}
                      />
                      <label
                        htmlFor={`cat-${index}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <span className="font-medium">{cat.name}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          cat.type === 'receita' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {cat.type === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <p className="text-xs text-muted-foreground">
                Categorias não selecionadas serão importadas como "Outros".
              </p>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="gap-2 sm:gap-0 flex-row justify-between">
            {currentStep === 'preview' && (
              <Button
                variant="ghost"
                onClick={resetImport}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
            {currentStep === 'categories' && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('preview')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
            {currentStep === 'upload' && <div />}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              
              {currentStep === 'preview' && (
                <Button
                  onClick={handleProceedFromPreview}
                  disabled={isImporting}
                  className="gap-2"
                >
                  {unknownCategories.length > 0 ? (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {isImporting ? 'Importando...' : 'Importar'}
                    </>
                  )}
                </Button>
              )}
              
              {currentStep === 'categories' && (
                <Button
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isImporting ? 'Processando...' : 'Confirmar e Importar'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
