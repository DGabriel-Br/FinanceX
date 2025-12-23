import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { PeriodFilter, CustomDateRange } from './PeriodFilter';
import { DebtTracker } from './DebtTracker';
import { CategoryCharts } from './CategoryCharts';
import { Transaction } from '@/types/transaction';
import { Debt } from '@/types/debt';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from 'recharts';
import { useMemo } from 'react';

interface DashboardProps {
  totals: {
    receitas: number;
    despesas: number;
    saldo: number;
  };
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
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

export const Dashboard = ({ 
  totals, 
  customRange, 
  onCustomRangeChange, 
  transactions, 
  allTransactions, 
  debts, 
  onNavigateToDebts 
}: DashboardProps) => {
  // Obtém o ano a partir do customRange ou usa o ano atual
  const selectedYear = customRange?.start?.getFullYear() || new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const isCurrentYear = selectedYear === currentYear;

  // Agrupa transações por mês para o gráfico
  const chartData = useMemo(() => {
    // Inicializa dados de todos os meses
    const monthlyData = MONTHS.map((month, index) => ({
      name: month,
      receitas: 0,
      despesas: 0,
      month: index,
      isCurrentMonth: isCurrentYear && index === currentMonth,
    }));

    // Agrupa transações por mês do ano selecionado
    allTransactions.forEach((transaction) => {
      const [year, monthStr] = transaction.date.split('-');
      const transactionYear = parseInt(year);
      const monthIndex = parseInt(monthStr) - 1;

      if (transactionYear === selectedYear && monthIndex >= 0 && monthIndex < 12) {
        if (transaction.type === 'receita') {
          monthlyData[monthIndex].receitas += transaction.value;
        } else {
          monthlyData[monthIndex].despesas += transaction.value;
        }
      }
    });

    return monthlyData;
  }, [allTransactions, selectedYear, isCurrentYear, currentMonth]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Resumo das suas finanças</p>
        </div>
        <PeriodFilter 
          customRange={customRange}
          onCustomRangeChange={onCustomRangeChange}
        />
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
      <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.3s', animationDuration: '0.6s', animationFillMode: 'both' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Receitas e Despesas por Mês ({selectedYear})
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                {/* Gradiente para Receitas */}
                <linearGradient id="gradientReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 71%, 55%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(142, 71%, 35%)" stopOpacity={1} />
                </linearGradient>
                {/* Gradiente para Despesas */}
                <linearGradient id="gradientDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0, 84%, 65%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(0, 84%, 45%)" stopOpacity={1} />
                </linearGradient>
                {/* Gradientes para mês atual (mais vibrantes) */}
                <linearGradient id="gradientReceitasAtual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 80%, 60%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(142, 80%, 40%)" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="gradientDespesasAtual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0, 90%, 70%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(0, 90%, 50%)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={({ x, y, payload }) => {
                  const monthIndex = MONTHS.indexOf(payload.value);
                  const isCurrentMonthTick = isCurrentYear && monthIndex === currentMonth;
                  return (
                    <text 
                      x={x} 
                      y={y + 12} 
                      textAnchor="middle" 
                      fill={isCurrentMonthTick ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      fontSize={12}
                      fontWeight={isCurrentMonthTick ? 600 : 400}
                    >
                      {payload.value}
                      {isCurrentMonthTick && (
                        <tspan x={x} y={y + 24} fontSize={10} fill="hsl(var(--primary))">●</tspan>
                      )}
                    </text>
                  );
                }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                height={40}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
                width={80}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const monthIndex = MONTHS.indexOf(label);
                    const isCurrentMonthTooltip = isCurrentYear && monthIndex === currentMonth;
                    return (
                      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
                        <p className="font-semibold text-foreground mb-2">
                          {label}
                          {isCurrentMonthTooltip && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Mês atual
                            </span>
                          )}
                        </p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm">
                            <span 
                              className="font-medium"
                              style={{ color: entry.dataKey === 'receitas' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}
                            >
                              {entry.name}:
                            </span>
                            <span className="text-foreground ml-1">
                              {formatCurrency(entry.value as number)}
                            </span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                payload={[
                  { value: 'Receitas', type: 'square', color: 'hsl(142, 71%, 45%)' },
                  { value: 'Despesas', type: 'square', color: 'hsl(0, 84%, 60%)' },
                ]}
              />
              <Bar 
                dataKey="receitas" 
                name="Receitas" 
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`receitas-${index}`} 
                    fill={entry.isCurrentMonth ? 'url(#gradientReceitasAtual)' : 'url(#gradientReceitas)'}
                    stroke={entry.isCurrentMonth ? 'hsl(var(--primary))' : 'none'}
                    strokeWidth={entry.isCurrentMonth ? 2 : 0}
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="despesas" 
                name="Despesas" 
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`despesas-${index}`} 
                    fill={entry.isCurrentMonth ? 'url(#gradientDespesasAtual)' : 'url(#gradientDespesas)'}
                    stroke={entry.isCurrentMonth ? 'hsl(var(--primary))' : 'none'}
                    strokeWidth={entry.isCurrentMonth ? 2 : 0}
                  />
                ))}
              </Bar>
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
