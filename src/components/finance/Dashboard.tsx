import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PeriodFilter } from './PeriodFilter';
import { DebtTracker } from './DebtTracker';
import { CategoryCharts } from './CategoryCharts';
import { PeriodFilter as PeriodFilterType, Transaction } from '@/types/transaction';
import { Debt } from '@/types/debt';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

interface DashboardProps {
  totals: {
    receitas: number;
    despesas: number;
    saldo: number;
  };
  filter: PeriodFilterType;
  onFilterChange: (filter: PeriodFilterType) => void;
  transactions: Transaction[];
  allTransactions: Transaction[];
  debts: Debt[];
  onNavigateToDebts?: () => void;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const Dashboard = ({ totals, filter, onFilterChange, transactions, allTransactions, debts, onNavigateToDebts }: DashboardProps) => {
  // Agrupa transações por mês para o gráfico
  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    // Inicializa dados de todos os meses
    const monthlyData = MONTHS.map((month, index) => ({
      name: month,
      receitas: 0,
      despesas: 0,
      month: index,
    }));

    // Agrupa transações por mês do ano atual
    transactions.forEach((transaction) => {
      const [year, monthStr] = transaction.date.split('-');
      const transactionYear = parseInt(year);
      const monthIndex = parseInt(monthStr) - 1;

      if (transactionYear === currentYear && monthIndex >= 0 && monthIndex < 12) {
        if (transaction.type === 'receita') {
          monthlyData[monthIndex].receitas += transaction.value;
        } else {
          monthlyData[monthIndex].despesas += transaction.value;
        }
      }
    });

    return monthlyData;
  }, [transactions]);

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

      {/* Gráfico de colunas */}
      <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Receitas e Despesas por Mês ({new Date().getFullYear()})
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar 
                dataKey="receitas" 
                name="Receitas" 
                fill="hsl(var(--income))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="despesas" 
                name="Despesas" 
                fill="hsl(var(--expense))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Acompanhamento de Dívidas */}
      <div className="mt-6">
        <DebtTracker debts={debts} transactions={allTransactions} onNavigateToDebts={onNavigateToDebts} />
      </div>

      {/* Gráficos de Pizza por Categoria */}
      <CategoryCharts transactions={transactions} />
    </div>
  );
};
