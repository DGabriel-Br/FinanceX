import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory, incomeCategoryLabels, expenseCategoryLabels } from '@/types/transaction';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExcelImportExportProps {
  transactions: Transaction[];
  onImport: (transactions: Array<{ type: TransactionType; category: TransactionCategory; date: string; description: string; value: number }>) => Promise<void>;
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

export const ExcelImportExport = ({ transactions, onImport }: ExcelImportExportProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
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

    // Ajustar largura das colunas
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

  const parseCategory = (categoryStr: string, type: TransactionType): TransactionCategory | null => {
    const normalized = categoryStr.toLowerCase().trim();
    
    if (type === 'receita') {
      return incomeCategoryKeysMap[normalized] || null;
    }
    return expenseCategoryKeysMap[normalized] || null;
  };

  const parseDate = (dateValue: unknown): string | null => {
    if (!dateValue) return null;

    // Se for número (Excel serial date)
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return date.toISOString().split('T')[0];
    }

    // Se for string
    if (typeof dateValue === 'string') {
      const str = dateValue.trim();
      
      // Formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      
      // Formato DD/MM/YYYY
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
      const validTransactions: Array<{ type: TransactionType; category: TransactionCategory; date: string; description: string; value: number }> = [];

      jsonData.forEach((row: unknown, index: number) => {
        const rowNum = index + 2; // +2 porque Excel começa em 1 e tem header
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
        const categoryStr = String(r['Categoria'] || '');
        const category = parseCategory(categoryStr, type);
        if (!category) {
          errors.push(`Linha ${rowNum}: Categoria inválida "${categoryStr}" para ${type}.`);
          return;
        }

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

        validTransactions.push({
          type,
          category,
          date,
          description,
          value: Number(value),
        });
      });

      if (errors.length > 0) {
        setImportErrors(errors);
      }

      if (validTransactions.length > 0) {
        await onImport(validTransactions);
        toast.success(`${validTransactions.length} lançamento(s) importado(s) com sucesso!`);
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

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
