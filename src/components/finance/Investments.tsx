import { useState, useMemo, useCallback } from 'react';
import { Plus, TrendingUp, PieChart, CalendarIcon, Wallet } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { 
  InvestmentType, 
  investmentTypeLabels, 
  investmentTypeIcons, 
  investmentTypeColors,
  extractInvestmentType 
} from '@/types/investment';
import { PeriodFilter, CustomDateRange } from './PeriodFilter';
import { cn } from '@/lib/utils';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface InvestmentsProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
  onNavigateToTransactions?: () => void;
}

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Componente de fatia ativa (expandida)
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
          transition: 'all 0.3s ease',
        }}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={14} fontWeight={600}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={12}>
        {formatCurrency(value)}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={11}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export const Investments = ({ 
  transactions, 
  allTransactions,
  customRange, 
  onCustomRangeChange,
  onNavigateToTransactions 
}: InvestmentsProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Filtra apenas transações de investimento
  const investmentTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'despesa' && t.category === 'investimentos');
  }, [transactions]);

  // Todas as transações de investimento (para cálculos gerais)
  const allInvestmentTransactions = useMemo(() => {
    return allTransactions.filter(t => t.type === 'despesa' && t.category === 'investimentos');
  }, [allTransactions]);

  // Agrupa investimentos por tipo
  const investmentsByType = useMemo(() => {
    const grouped = new Map<InvestmentType, number>();
    
    investmentTransactions.forEach(t => {
      const type = extractInvestmentType(t.description);
      const current = grouped.get(type) || 0;
      grouped.set(type, current + t.value);
    });

    return Array.from(grouped.entries())
      .map(([type, value]) => ({
        type,
        name: investmentTypeLabels[type],
        value,
        color: investmentTypeColors[type],
        Icon: investmentTypeIcons[type],
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [investmentTransactions]);

  // Total investido no período
  const totalInvested = investmentsByType.reduce((sum, item) => sum + item.value, 0);

  // Total investido (histórico completo)
  const totalInvestedAllTime = allInvestmentTransactions.reduce((sum, t) => sum + t.value, 0);

  // Últimos aportes
  const recentInvestments = useMemo(() => {
    return [...investmentTransactions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [investmentTransactions]);

  // Investimento por mês (para o gráfico de evolução)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = customRange?.start?.getFullYear() || new Date().getFullYear();
    
    const data = months.map((month, index) => ({
      name: month,
      value: 0,
      month: index,
    }));

    allInvestmentTransactions.forEach(t => {
      const [year, monthStr] = t.date.split('-');
      const transactionYear = parseInt(year);
      const monthIndex = parseInt(monthStr) - 1;

      if (transactionYear === currentYear && monthIndex >= 0 && monthIndex < 12) {
        data[monthIndex].value += t.value;
      }
    });

    return data;
  }, [allInvestmentTransactions, customRange]);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Controle de Investimentos</h2>
          <p className="text-muted-foreground mt-1">Acompanhe seus aportes e a distribuição dos investimentos</p>
        </div>
        <PeriodFilter 
          customRange={customRange}
          onCustomRangeChange={onCustomRangeChange}
        />
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Investido no Período</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalInvested)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-income/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-income" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Investido (Histórico)</p>
              <p className="text-2xl font-bold text-income">
                {formatCurrency(totalInvestedAllTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <PieChart className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipos de Investimento</p>
              <p className="text-2xl font-bold text-foreground">
                {investmentsByType.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Como funciona:</strong> Os investimentos são identificados automaticamente a partir dos lançamentos com categoria "Investimentos". 
          Na descrição, inclua palavras-chave como "Reserva", "Ações", "FII", "Tesouro", "CDB", "Cripto" para classificação automática.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de distribuição */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Distribuição dos Investimentos</h3>
          </div>
          
          {investmentsByType.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={investmentsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                    >
                      {investmentsByType.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          style={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: activeIndex !== undefined && activeIndex !== index ? 0.6 : 1,
                          }}
                        />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {investmentsByType.map((item, index) => {
                  const Icon = item.Icon;
                  const percentage = (item.value / totalInvested) * 100;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between text-sm p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted/50"
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(undefined)}
                      style={{
                        backgroundColor: activeIndex === index ? 'hsl(var(--muted))' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <span className="text-foreground font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Nenhum investimento registrado</p>
              <button 
                onClick={onNavigateToTransactions}
                className="mt-4 text-primary hover:underline text-sm"
              >
                Ir para Lançamentos
              </button>
            </div>
          )}
        </div>

        {/* Últimos aportes */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Últimos Aportes</h3>
          </div>
          
          {recentInvestments.length > 0 ? (
            <div className="space-y-3">
              {recentInvestments.map((investment) => {
                const type = extractInvestmentType(investment.description);
                const Icon = investmentTypeIcons[type];
                const color = investmentTypeColors[type];
                const [year, month, day] = investment.date.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                
                return (
                  <div 
                    key={investment.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{investment.description}</p>
                        <p className="text-xs text-muted-foreground">{formattedDate}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatCurrency(investment.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Nenhum aporte no período</p>
            </div>
          )}
        </div>
      </div>

      {/* Progresso por tipo de investimento */}
      {investmentsByType.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Progresso dos Aportes</h3>
          <div className="space-y-4">
            {investmentsByType.map((item, index) => {
              const Icon = item.Icon;
              const percentage = (item.value / totalInvested) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(item.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
