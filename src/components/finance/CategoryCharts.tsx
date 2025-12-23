import { useMemo, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, expenseCategoryLabels, incomeCategoryLabels, ExpenseCategory, IncomeCategory } from '@/types/transaction';

interface CategoryChartsProps {
  transactions: Transaction[];
}

// Cores para as categorias
const EXPENSE_COLORS = [
  'hsl(0, 84%, 60%)',      // contas_fixas
  'hsl(262, 83%, 58%)',    // investimentos
  'hsl(25, 95%, 53%)',     // dividas
  'hsl(199, 89%, 48%)',    // educacao
  'hsl(142, 71%, 45%)',    // transporte
  'hsl(47, 96%, 53%)',     // mercado
  'hsl(330, 81%, 60%)',    // delivery
  'hsl(215, 16%, 47%)',    // outros_despesa
];

const INCOME_COLORS = [
  'hsl(142, 76%, 36%)',    // salario
  'hsl(142, 69%, 58%)',    // 13_salario
  'hsl(160, 84%, 39%)',    // ferias
  'hsl(173, 80%, 40%)',    // freelance
  'hsl(158, 64%, 52%)',    // outros_receita
];

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
      {/* Fatia expandida */}
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
      {/* Texto no centro */}
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

export const CategoryCharts = ({ transactions }: CategoryChartsProps) => {
  const [activeExpenseIndex, setActiveExpenseIndex] = useState<number | undefined>(undefined);
  const [activeIncomeIndex, setActiveIncomeIndex] = useState<number | undefined>(undefined);

  // Agrupa despesas por categoria
  const expenseData = useMemo(() => {
    const categoryTotals = new Map<ExpenseCategory, number>();
    
    transactions
      .filter(t => t.type === 'despesa')
      .forEach(t => {
        const current = categoryTotals.get(t.category as ExpenseCategory) || 0;
        categoryTotals.set(t.category as ExpenseCategory, current + t.value);
      });

    return Array.from(categoryTotals.entries())
      .map(([category, value], index) => ({
        name: expenseCategoryLabels[category] || category,
        value,
        color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Agrupa receitas por categoria
  const incomeData = useMemo(() => {
    const categoryTotals = new Map<IncomeCategory, number>();
    
    transactions
      .filter(t => t.type === 'receita')
      .forEach(t => {
        const current = categoryTotals.get(t.category as IncomeCategory) || 0;
        categoryTotals.set(t.category as IncomeCategory, current + t.value);
      });

    return Array.from(categoryTotals.entries())
      .map(([category, value], index) => ({
        name: incomeCategoryLabels[category] || category,
        value,
        color: INCOME_COLORS[index % INCOME_COLORS.length],
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);

  const onExpensePieEnter = useCallback((_: any, index: number) => {
    setActiveExpenseIndex(index);
  }, []);

  const onExpensePieLeave = useCallback(() => {
    setActiveExpenseIndex(undefined);
  }, []);

  const onIncomePieEnter = useCallback((_: any, index: number) => {
    setActiveIncomeIndex(index);
  }, []);

  const onIncomePieLeave = useCallback(() => {
    setActiveIncomeIndex(undefined);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de Despesas */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.4s', animationDuration: '0.6s', animationFillMode: 'both' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-expense" />
          <h3 className="text-lg font-semibold text-foreground">Despesas por Categoria</h3>
        </div>
        
        {expenseData.length > 0 ? (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    activeIndex={activeExpenseIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={onExpensePieEnter}
                    onMouseLeave={onExpensePieLeave}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell 
                        key={`expense-cell-${index}`} 
                        fill={entry.color}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: activeExpenseIndex !== undefined && activeExpenseIndex !== index ? 0.6 : 1,
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {expenseData.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted/50"
                  onMouseEnter={() => setActiveExpenseIndex(index)}
                  onMouseLeave={() => setActiveExpenseIndex(undefined)}
                  style={{
                    backgroundColor: activeExpenseIndex === index ? 'hsl(var(--muted))' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full transition-transform"
                      style={{ 
                        backgroundColor: item.color,
                        transform: activeExpenseIndex === index ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((item.value / totalExpenses) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Nenhuma despesa registrada</p>
          </div>
        )}
      </div>

      {/* Gráfico de Receitas */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '0.6s', animationFillMode: 'both' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-income" />
          <h3 className="text-lg font-semibold text-foreground">Receitas por Categoria</h3>
        </div>
        
        {incomeData.length > 0 ? (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    activeIndex={activeIncomeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={onIncomePieEnter}
                    onMouseLeave={onIncomePieLeave}
                  >
                    {incomeData.map((entry, index) => (
                      <Cell 
                        key={`income-cell-${index}`} 
                        fill={entry.color}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: activeIncomeIndex !== undefined && activeIncomeIndex !== index ? 0.6 : 1,
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {incomeData.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted/50"
                  onMouseEnter={() => setActiveIncomeIndex(index)}
                  onMouseLeave={() => setActiveIncomeIndex(undefined)}
                  style={{
                    backgroundColor: activeIncomeIndex === index ? 'hsl(var(--muted))' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full transition-transform"
                      style={{ 
                        backgroundColor: item.color,
                        transform: activeIncomeIndex === index ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((item.value / totalIncome) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Nenhuma receita registrada</p>
          </div>
        )}
      </div>
    </div>
  );
};
