import { Transaction, PeriodFilter as PeriodFilterType, TransactionType } from '@/types/transaction';
import { PeriodFilter } from './PeriodFilter';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';

interface TransactionsProps {
  transactions: Transaction[];
  filter: PeriodFilterType;
  onFilterChange: (filter: PeriodFilterType) => void;
  onAdd: (transaction: { type: TransactionType; date: string; description: string; value: number }) => void;
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export const Transactions = ({
  transactions,
  filter,
  onFilterChange,
  onAdd,
  onUpdate,
  onDelete,
}: TransactionsProps) => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lançamentos</h2>
          <p className="text-muted-foreground mt-1">Gerencie suas receitas e despesas</p>
        </div>
        <PeriodFilter value={filter} onChange={onFilterChange} />
      </div>

      {/* Layout em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
