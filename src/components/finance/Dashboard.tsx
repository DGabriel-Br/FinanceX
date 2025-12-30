import { memo, useMemo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { PeriodFilter, CustomDateRange } from './PeriodFilter';
import { DebtTracker } from './DebtTracker';
import { CategoryCharts } from './CategoryCharts';
import { Transaction } from '@/types/transaction';
import { Debt } from '@/types/debt';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { calculatePreviousYearBalance, calculateMonthlyData } from '@/core/finance';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardProps {
  totals: {
    receitas: number;
    despesas: number;
    saldoAnterior: number;
    saldoPeriodo: number;
    saldo: number;
  };
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
  transactions: Transaction[];
  allTransactions: Transaction[];
  debts: Debt[];
  onNavigateToDebts?: () => void;
  showValues: boolean;
  onToggleValues: () => void;
  formatValue: (value: number) => string;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const MONTHS_SHORT = [
  'J', 'F', 'M', 'A', 'M', 'J',
  'J', 'A', 'S', 'O', 'N', 'D'
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Memoized summary card to prevent re-renders
const SummaryCard = memo(({ 
  icon: Icon, 
  title, 
  value, 
  colorClass, 
  bgClass,
  delay 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  colorClass: string;
  bgClass: string;
  delay: string;
}) => (
  <div 
    className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm animate-fade-in hover:shadow-lg hover:scale-[1.02] transition-all duration-300" 
    style={{ animationDelay: delay, animationDuration: '0.5s', animationFillMode: 'both' }}
  >
    <div className="flex items-center gap-3 md:gap-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${bgClass} flex items-center justify-center animate-scale-in`} style={{ animationDelay: `calc(${delay} + 0.1s)`, animationDuration: '0.4s', animationFillMode: 'both' }}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colorClass}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-muted-foreground">{title}</p>
        <p className={`text-lg md:text-2xl font-bold ${colorClass} truncate`}>
          {value}
        </p>
      </div>
    </div>
  </div>
));
SummaryCard.displayName = 'SummaryCard';

// Memoized chart component
const MonthlyChart = memo(({ 
  chartData, 
  isMobile, 
  showValues,
  selectedYear 
}: { 
  chartData: ReturnType<typeof calculateMonthlyData>;
  isMobile: boolean;
  showValues: boolean;
  selectedYear: number;
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const isCurrentYear = selectedYear === currentYear;

  return (
    <div className="mt-6 bg-card border border-border rounded-xl p-3 md:p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.3s', animationDuration: '0.6s', animationFillMode: 'both' }}>
      <h3 className="text-sm md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        <span className="hidden sm:inline">Receitas e Despesas por Mês ({selectedYear})</span>
        <span className="sm:hidden">Receitas/Despesas ({selectedYear})</span>
      </h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={isMobile 
              ? { top: 10, right: 5, left: -15, bottom: 5 }
              : { top: 20, right: 20, left: 0, bottom: 5 }
            }
          >
            <defs>
              <linearGradient id="gradientReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 71%, 55%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(142, 71%, 35%)" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="gradientDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 65%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(0, 84%, 45%)" stopOpacity={1} />
              </linearGradient>
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
                const displayName = isMobile ? MONTHS_SHORT[monthIndex] : payload.value;
                return (
                  <g>
                    <text 
                      x={x} 
                      y={y + (isMobile ? 12 : 16)} 
                      textAnchor="middle" 
                      fill={isCurrentMonthTick ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      fontSize={isMobile ? 9 : 12}
                      fontWeight={isCurrentMonthTick ? 600 : 400}
                    >
                      {displayName}
                    </text>
                    {isCurrentMonthTick && !isMobile && (
                      <text x={x} y={y + 28} textAnchor="middle" fontSize={10} fill="hsl(var(--primary))">●</text>
                    )}
                  </g>
                );
              }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
              tickMargin={4}
              interval={0}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 9 : 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => {
                if (!showValues) return '••••';
                return isMobile 
                  ? (value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString())
                  : value.toLocaleString('pt-BR');
              }}
              width={isMobile ? 35 : 60}
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
                            {showValues ? formatCurrency(entry.value as number) : '••••••'}
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
              wrapperStyle={{ paddingTop: isMobile ? '10px' : '20px', fontSize: isMobile ? '10px' : '14px' }}
              payload={[
                { value: 'Receitas', type: 'square', color: 'hsl(142, 71%, 45%)' },
                { value: 'Despesas', type: 'square', color: 'hsl(0, 84%, 60%)' },
              ]}
            />
            <Bar 
              dataKey="receitas" 
              name="Receitas" 
              radius={isMobile ? [3, 3, 0, 0] : [6, 6, 0, 0]}
              barSize={isMobile ? 8 : undefined}
              isAnimationActive={!isMobile} // Disable animations on mobile for performance
              animationBegin={300}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`receitas-${index}`} 
                  fill={entry.isCurrentMonth ? 'url(#gradientReceitasAtual)' : 'url(#gradientReceitas)'}
                  stroke={entry.isCurrentMonth ? 'hsl(var(--primary))' : 'none'}
                  strokeWidth={entry.isCurrentMonth ? (isMobile ? 1 : 2) : 0}
                />
              ))}
            </Bar>
            <Bar 
              dataKey="despesas" 
              name="Despesas" 
              radius={isMobile ? [3, 3, 0, 0] : [6, 6, 0, 0]}
              barSize={isMobile ? 8 : undefined}
              isAnimationActive={!isMobile} // Disable animations on mobile for performance
              animationBegin={400}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`despesas-${index}`} 
                  fill={entry.isCurrentMonth ? 'url(#gradientDespesasAtual)' : 'url(#gradientDespesas)'}
                  stroke={entry.isCurrentMonth ? 'hsl(var(--primary))' : 'none'}
                  strokeWidth={entry.isCurrentMonth ? (isMobile ? 1 : 2) : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
MonthlyChart.displayName = 'MonthlyChart';

export const Dashboard = memo(({ 
  totals, 
  customRange, 
  onCustomRangeChange, 
  transactions, 
  allTransactions, 
  debts, 
  onNavigateToDebts,
  showValues,
  onToggleValues,
  formatValue
}: DashboardProps) => {
  const isMobile = useIsMobile();

  // Memoize year calculation
  const selectedYear = useMemo(() => 
    customRange?.start?.getFullYear() || new Date().getFullYear(),
    [customRange?.start]
  );

  // Memoize previous year balance - only recalculate when allTransactions or year changes
  const previousYearBalance = useMemo(() => {
    return calculatePreviousYearBalance(allTransactions, selectedYear);
  }, [allTransactions, selectedYear]);

  // Memoize chart data - only recalculate when dependencies change
  const chartData = useMemo(() => {
    return calculateMonthlyData(allTransactions, selectedYear, previousYearBalance);
  }, [allTransactions, selectedYear, previousYearBalance]);

  // Memoize formatted values to prevent re-renders
  const formattedReceitas = useMemo(() => formatValue(totals.receitas), [formatValue, totals.receitas]);
  const formattedDespesas = useMemo(() => formatValue(totals.despesas), [formatValue, totals.despesas]);
  const formattedSaldo = useMemo(() => formatValue(totals.saldo), [formatValue, totals.saldo]);

  // Memoize saldo color class
  const saldoColorClass = totals.saldo >= 0 ? 'text-income' : 'text-expense';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-6 md:mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">Dashboard</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1 hidden sm:block">Resumo das suas finanças</p>
        </div>
        <PeriodFilter 
          customRange={customRange}
          onCustomRangeChange={onCustomRangeChange}
          showValues={showValues}
          onToggleValues={onToggleValues}
        />
      </div>

      {/* Cards - usando componentes memoizados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        <SummaryCard
          icon={TrendingUp}
          title="Receitas"
          value={formattedReceitas}
          colorClass="text-income"
          bgClass="bg-income/10"
          delay="0.1s"
        />
        <SummaryCard
          icon={TrendingDown}
          title="Despesas"
          value={formattedDespesas}
          colorClass="text-expense"
          bgClass="bg-expense/10"
          delay="0.15s"
        />
        <SummaryCard
          icon={Wallet}
          title="Saldo"
          value={formattedSaldo}
          colorClass={saldoColorClass}
          bgClass="bg-primary/10"
          delay="0.2s"
        />
      </div>

      {/* Dica */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> Vá até a aba "Lançamentos" para adicionar suas receitas e despesas.
        </p>
      </div>

      {/* Gráfico memoizado */}
      <MonthlyChart 
        chartData={chartData}
        isMobile={isMobile}
        showValues={showValues}
        selectedYear={selectedYear}
      />

      {/* Acompanhamento de Dívidas */}
      <div className="mt-6">
        <DebtTracker debts={debts} transactions={allTransactions} onNavigateToDebts={onNavigateToDebts} formatValue={formatValue} />
      </div>

      {/* Gráficos de Pizza por Categoria */}
      <CategoryCharts transactions={transactions} formatValue={formatValue} />
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
