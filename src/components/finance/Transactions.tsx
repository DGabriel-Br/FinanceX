import { Transaction, TransactionType, TransactionCategory } from '@/types/transaction';
import { PeriodFilter, CustomDateRange } from './PeriodFilter';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { ExcelImportExport } from './ExcelImportExport';

interface TransactionsProps {
  transactions: Transaction[];
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
  onAdd: (transaction: { type: TransactionType; category: TransactionCategory; date: string; description: string; value: number }) => void;
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
  const handleImport = async (importedTransactions: Array<{ type: TransactionType; category: TransactionCategory; date: string; description: string; value: number }>) => {
    for (const t of importedTransactions) {
      await onAdd(t);
    }
  };

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
        <div className="flex items-center gap-2">
          <ExcelImportExport transactions={transactions} onImport={handleImport} />
          <PeriodFilter 
            customRange={customRange}
            onCustomRangeChange={onCustomRangeChange}
            showValues={showValues}
            onToggleValues={onToggleValues}
            hideToggleOnMobile
          />
        </div>
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
