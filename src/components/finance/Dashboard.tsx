import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PeriodFilter } from './PeriodFilter';
import { PeriodFilter as PeriodFilterType, Transaction } from '@/types/transaction';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
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
}

const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Formatar valor compacto para labels
const formatCompact = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const Dashboard = ({ totals, filter, onFilterChange, transactions }: DashboardProps) => {
  // Agrupa transações por mês para o gráfico
  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    // Inicializa dados de todos os meses
    const monthlyData = MONTHS_FULL.map((month, index) => ({
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

      {/* Gráfico de colunas */}
      <div className="mt-8 bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-center text-lg font-bold text-foreground mb-6 underline">
          GRÁFICO - RECEITAS X DESPESAS MENSAL
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 30, right: 20, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <CartesianGrid 
                strokeDasharray="0" 
                stroke="hsl(var(--border))" 
                vertical={true}
                horizontal={true}
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                interval={0}
                angle={0}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
                domain={[0, 'auto']}
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
              <Bar 
                dataKey="receitas" 
                name="Receitas" 
                fill="#22c55e"
                barSize={30}
              >
                <LabelList 
                  dataKey="receitas" 
                  position="top" 
                  formatter={(value: number) => value > 0 ? formatCompact(value) : ''}
                  style={{ fill: '#22c55e', fontSize: 11, fontWeight: 500 }}
                />
              </Bar>
              <Bar 
                dataKey="despesas" 
                name="Despesas" 
                fill="#dc2626"
                barSize={30}
              >
                <LabelList 
                  dataKey="despesas" 
                  position="top" 
                  formatter={(value: number) => value > 0 ? formatCompact(value) : ''}
                  style={{ fill: '#dc2626', fontSize: 11, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
