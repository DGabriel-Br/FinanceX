import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PeriodFilter } from './PeriodFilter';
import { PeriodFilter as PeriodFilterType } from '@/types/transaction';

interface DashboardProps {
  totals: {
    receitas: number;
    despesas: number;
    saldo: number;
  };
  filter: PeriodFilterType;
  onFilterChange: (filter: PeriodFilterType) => void;
}

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const Dashboard = ({ totals, filter, onFilterChange }: DashboardProps) => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Resumo das suas finanças</p>
        </div>
        <PeriodFilter value={filter} onChange={onFilterChange} />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receitas */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-income/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-income" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="text-2xl font-bold text-income">
                {formatCurrency(totals.receitas)}
              </p>
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-expense/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-expense" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-expense">
                {formatCurrency(totals.despesas)}
              </p>
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${totals.saldo >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(totals.saldo)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dica */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> Vá até a aba "Lançamentos" para adicionar suas receitas e despesas.
        </p>
      </div>
    </div>
  );
};
