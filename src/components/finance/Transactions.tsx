import { Transaction, TransactionType } from '@/types/transaction';
import { PeriodFilter, CustomDateRange } from './PeriodFilter';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { ExcelImportExport } from './ExcelImportExport';
import { useCustomCategories, CustomCategory } from '@/hooks/useCustomCategories';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransactionsProps {
  transactions: Transaction[];
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
  onAdd: (transaction: { type: TransactionType; category: string; date: string; description: string; value: number }) => void;
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  formatValue?: (value: number) => string;
  showValues?: boolean;
  onToggleValues?: () => void;
}

export const Transactions = ({
  transactions,
  customRange,
  onCustomRangeChange,
  onAdd,
  onUpdate,
  onDelete,
  formatValue,
  showValues,
  onToggleValues,
}: TransactionsProps) => {
  const { categories: customCategories, addCategory, refetch } = useCustomCategories();
  const isMobile = useIsMobile();

  const handleImport = async (importedTransactions: Array<{ type: TransactionType; category: string; date: string; description: string; value: number }>) => {
    for (const t of importedTransactions) {
      // Se a categoria começa com custom_new_, precisa buscar o ID da categoria recém-criada
      let categoryToUse = t.category;
      
      if (t.category.startsWith('custom_new_')) {
        const categoryName = t.category.replace('custom_new_', '');
        const existingCategory = customCategories.find(
          c => c.name.toLowerCase() === categoryName.toLowerCase() && c.type === t.type
        );
        if (existingCategory) {
          categoryToUse = `custom_${existingCategory.id}`;
        }
      }
      
      await onAdd({ ...t, category: categoryToUse });
    }
  };

  const handleCreateCategories = async (categories: Array<{ name: string; type: 'receita' | 'despesa' }>) => {
    let allSuccess = true;
    
    for (const cat of categories) {
      const success = await addCategory(cat.name, cat.type, 'tag');
      if (!success) {
        allSuccess = false;
      }
    }
    
    // Atualizar lista de categorias
    await refetch();
    
    return allSuccess;
  };

  const excelImportExportComponent = (
    <ExcelImportExport 
      transactions={transactions} 
      onImport={handleImport}
      customCategories={customCategories}
      onCreateCategories={handleCreateCategories}
    />
  );

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div 
        className="flex items-start justify-between gap-3 mb-6 md:mb-8 opacity-0 animate-fade-in"
        style={{ animationDelay: '0.05s' }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Lançamentos</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1 hidden sm:block">Gerencie suas receitas e despesas</p>
        </div>
        <PeriodFilter 
          customRange={customRange}
          onCustomRangeChange={onCustomRangeChange}
          showValues={showValues}
          onToggleValues={onToggleValues}
          hideToggleOnMobile
          customAction={!isMobile ? excelImportExportComponent : undefined}
        />
      </div>

      {/* Layout em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Formulário */}
        <div 
          className="lg:col-span-1 opacity-0 animate-slide-in-left"
          style={{ animationDelay: '0.1s' }}
        >
          <TransactionForm onSubmit={onAdd} />
        </div>

        {/* Botão de Importar/Exportar - Apenas mobile, entre formulário e lista */}
        {isMobile && (
          <div 
            className="flex justify-end gap-3 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.12s' }}
          >
            {excelImportExportComponent}
          </div>
        )}

        {/* Lista */}
        <div 
          className="lg:col-span-2 opacity-0 animate-slide-in-right"
          style={{ animationDelay: '0.15s' }}
        >
          <TransactionList
            transactions={transactions}
            onUpdate={onUpdate}
            onDelete={onDelete}
            formatValue={formatValue}
          />
        </div>
      </div>
    </div>
  );
};
