import { Transaction, TransactionType } from '@/types/transaction';
import { PeriodFilter, CustomDateRange } from './PeriodFilter';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';

interface TransactionsProps {
  transactions: Transaction[];
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
  onAdd: (transaction: { type: TransactionType; date: string; description: string; value: number }) => void;
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export const Transactions = ({
  transactions,
  customRange,
  onCustomRangeChange,
  onAdd,
  onUpdate,
  onDelete,
}: TransactionsProps) => {
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Lançamentos</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gerencie suas receitas e despesas</p>
        </div>
        <PeriodFilter 
          customRange={customRange}
          onCustomRangeChange={onCustomRangeChange}
        />
      </div>

      {/* Layout em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <TransactionForm onSubmit={onAdd} />
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          <TransactionList
            transactions={transactions}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};
