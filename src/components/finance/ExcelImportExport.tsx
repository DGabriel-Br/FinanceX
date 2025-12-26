import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, AlertCircle, Plus, Check } from 'lucide-react';
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
  categoryIsCustom: boolean;
  date: string;
  description: string;
  value: number;
}

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
  const [showCategoryConfirmation, setShowCategoryConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryLabel = (category: TransactionCategory, type: TransactionType): string => {
    if (type === 'receita') {
      return incomeCategoryLabels[category as keyof typeof incomeCategoryLabels] || category;
    }
    return expenseCategoryLabels[category as keyof typeof expenseCategoryLabels] || category;
  };

  const exportToExcel = () => {
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
    XLSX.writeFile(workbook, fileName);
    toast.success('Lançamentos exportados com sucesso!');
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

  const parseCategory = (categoryStr: string, type: TransactionType): { key: string | null; isCustom: boolean } => {
    const normalized = categoryStr.toLowerCase().trim();
    
    // Verificar categorias padrão
    if (type === 'receita') {
      const defaultKey = incomeCategoryKeysMap[normalized];
      if (defaultKey) return { key: defaultKey, isCustom: false };
    } else {
      const defaultKey = expenseCategoryKeysMap[normalized];
      if (defaultKey) return { key: defaultKey, isCustom: false };
    }
    
    // Verificar categorias personalizadas existentes
    const existingCustom = customCategories.find(
      c => c.name.toLowerCase() === normalized && c.type === type
    );
    if (existingCustom) {
      return { key: `custom_${existingCustom.id}`, isCustom: true };
    }
    
    return { key: null, isCustom: false };
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

        const { key: categoryKey, isCustom } = parseCategory(categoryStr, type);

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
          // Usar o nome original temporariamente
          parsedTransactions.push({
            type,
            category: categoryStr,
            categoryIsCustom: true,
            date,
            description,
            value: Number(value),
          });
        } else {
          parsedTransactions.push({
            type,
            category: categoryKey,
            categoryIsCustom: isCustom,
            date,
            description,
            value: Number(value),
          });
        }
      });

      if (errors.length > 0) {
        setImportErrors(errors);
      }

      // Se há categorias desconhecidas, mostrar confirmação
      if (unknownCats.size > 0 && onCreateCategories) {
        setUnknownCategories(Array.from(unknownCats.values()));
        setPendingTransactions(parsedTransactions);
        setShowCategoryConfirmation(true);
        setIsImporting(false);
        return;
      }

      // Se não há categorias desconhecidas, importar diretamente
      if (parsedTransactions.length > 0) {
        await onImport(parsedTransactions.map(t => ({
          type: t.type,
          category: t.category,
          date: t.date,
          description: t.description,
          value: t.value,
        })));
        toast.success(`${parsedTransactions.length} lançamento(s) importado(s) com sucesso!`);
        setIsImportDialogOpen(false);
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

  const handleConfirmCategories = async () => {
    if (!onCreateCategories) return;

    setIsImporting(true);
    
    try {
      // Criar categorias selecionadas
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
        const isNotSelected = notSelectedCategories.some(
          c => c.name.toLowerCase() === t.category.toLowerCase() && c.type === t.type
        );
        
        if (isNotSelected) {
          return {
            ...t,
            category: t.type === 'receita' ? 'outros_receita' : 'outros_despesa'
          };
        }
        
        // Para categorias criadas, usar o nome como custom_[name]
        const wasSelected = selectedCategories.some(
          c => c.name.toLowerCase() === t.category.toLowerCase() && c.type === t.type
        );
        
        if (wasSelected) {
          return {
            ...t,
            category: `custom_new_${t.category}` // Marcador temporário para nova categoria
          };
        }
        
        return t;
      });

      // Importar transações
      await onImport(updatedTransactions.map(t => ({
        type: t.type,
        category: t.category,
        date: t.date,
        description: t.description,
        value: t.value,
      })));

      const totalCreated = selectedCategories.length;
      const totalImported = updatedTransactions.length;
      
      if (totalCreated > 0) {
        toast.success(`${totalCreated} categoria(s) criada(s) e ${totalImported} lançamento(s) importado(s)!`);
      } else {
        toast.success(`${totalImported} lançamento(s) importado(s) com sucesso!`);
      }
      
      setShowCategoryConfirmation(false);
      setIsImportDialogOpen(false);
      setUnknownCategories([]);
      setPendingTransactions([]);
    } catch (error) {
      console.error('Erro ao processar importação:', error);
      toast.error('Erro ao processar importação');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancelCategories = () => {
    setShowCategoryConfirmation(false);
    setUnknownCategories([]);
    setPendingTransactions([]);
  };

  return (
    <>
      {/* Botão Importar */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsImportDialogOpen(true)}
        className="gap-1.5 h-8 md:h-9 px-2 md:px-3"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline text-xs md:text-sm">Importar</span>
      </Button>

      {/* Botão Exportar */}
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="gap-1.5 h-8 md:h-9 px-2 md:px-3"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline text-xs md:text-sm">Exportar</span>
      </Button>

      {/* Dialog de Importação */}
      <Dialog open={isImportDialogOpen && !showCategoryConfirmation} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Lançamentos</DialogTitle>
            <DialogDescription>
              Selecione um arquivo Excel (.xlsx) para importar lançamentos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                O arquivo deve conter as colunas: Tipo, Categoria, Data, Descrição, Valor
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar modelo
                </Button>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? 'Importando...' : 'Selecionar arquivo'}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {importErrors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 p-3 max-h-40 overflow-auto">
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

            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Categorias aceitas:</p>
              <p><strong>Receitas:</strong> Salário, 13º Salário, Férias, Freelance, Outros</p>
              <p><strong>Despesas:</strong> Contas Fixas Mensais, Investimentos, Dívidas, Educação, Transporte, Mercado, Delivery, Outros</p>
              <p className="mt-2 text-primary">Categorias personalizadas serão criadas automaticamente (com sua permissão).</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Categorias */}
      <Dialog open={showCategoryConfirmation} onOpenChange={(open) => !open && handleCancelCategories()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Novas Categorias Encontradas
            </DialogTitle>
            <DialogDescription>
              Encontramos categorias que não existem no sistema. Deseja criá-las?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-60 overflow-auto py-2">
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

          <p className="text-xs text-muted-foreground">
            Categorias não selecionadas serão importadas como "Outros".
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelCategories}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmCategories}
              disabled={isImporting}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              {isImporting ? 'Processando...' : 'Confirmar e Importar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
