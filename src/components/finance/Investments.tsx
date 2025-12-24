import { useState, useMemo, useCallback } from 'react';
import { Plus, TrendingUp, PieChart, CalendarIcon, Wallet, Target, Pencil, X, Check, ArrowDownToLine, History, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { 
  InvestmentType, 
  investmentTypeLabels, 
  investmentTypeIcons, 
  investmentTypeColors,
  extractInvestmentType 
} from '@/types/investment';
import { useInvestmentGoals } from '@/hooks/useInvestmentGoals';
import { PeriodFilter, CustomDateRange } from './PeriodFilter';
import { cn } from '@/lib/utils';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface InvestmentsProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
  onNavigateToTransactions?: () => void;
  onAddTransaction?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  formatValue?: (value: number) => string;
  showValues?: boolean;
  onToggleValues?: () => void;
}

// Formatar valor em Real brasileiro
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formata número para moeda brasileira (ex: 1.234,56)
const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseInt(numbers, 10) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Converte string formatada para número
const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

// Componente de fatia ativa (expandida)
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  // Usa o formatter do payload se disponível, senão formatCurrency
  const formatter = payload.formatter || formatCurrency;

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
        {formatter(value)}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={11}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

// Todos os tipos de investimento disponíveis
const allInvestmentTypes: InvestmentType[] = [
  'reserva_emergencia',
  'acoes',
  'fundos_imobiliarios',
  'renda_fixa',
  'tesouro_direto',
  'criptomoedas',
  'outros_investimentos',
];

export const Investments = ({ 
  transactions, 
  allTransactions,
  customRange, 
  onCustomRangeChange,
  onNavigateToTransactions,
  onAddTransaction,
  formatValue,
  showValues,
  onToggleValues,
}: InvestmentsProps) => {
  // Helper para formatar valores usando o prop ou fallback
  const displayValue = (value: number) => formatValue ? formatValue(value) : formatCurrency(value);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<InvestmentType | null>(null);
  const [goalInputValue, setGoalInputValue] = useState('');
  
  // Estado para resgate de investimento
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawType, setWithdrawType] = useState<InvestmentType>('reserva_emergencia');
  const [withdrawValue, setWithdrawValue] = useState('');
  const [withdrawDescription, setWithdrawDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'aporte' | 'resgate'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const { goals, setGoal, removeGoal, getGoal } = useInvestmentGoals();

  // Helper para obter data atual no formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleWithdraw = async () => {
    if (!onAddTransaction) {
      toast.error('Função de adicionar transação não disponível');
      return;
    }

    const value = parseCurrency(withdrawValue);
    if (value <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    const description = withdrawDescription.trim() 
      ? `Resgate ${investmentTypeLabels[withdrawType]} - ${withdrawDescription.trim()}`
      : `Resgate ${investmentTypeLabels[withdrawType]}`;
    
    setIsSubmitting(true);
    try {
      await onAddTransaction({
        type: 'receita',
        category: 'outros_receita',
        date: getTodayDate(),
        description: description,
        value: value,
      });
      
      toast.success('Resgate registrado com sucesso!');
      setIsWithdrawDialogOpen(false);
      setWithdrawType('reserva_emergencia');
      setWithdrawValue('');
      setWithdrawDescription('');
    } catch (error) {
      toast.error('Erro ao registrar resgate');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtra transações de investimento (aportes)
  const investmentTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'despesa' && t.category === 'investimentos');
  }, [transactions]);

  // Filtra transações de resgate de investimento
  const withdrawalTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.type === 'receita' && 
      t.description.toLowerCase().includes('resgate')
    );
  }, [transactions]);

  // Todas as transações de investimento (para cálculos gerais)
  const allInvestmentTransactions = useMemo(() => {
    return allTransactions.filter(t => t.type === 'despesa' && t.category === 'investimentos');
  }, [allTransactions]);

  // Todas as transações de resgate (para cálculos gerais)
  const allWithdrawalTransactions = useMemo(() => {
    return allTransactions.filter(t => 
      t.type === 'receita' && 
      t.description.toLowerCase().includes('resgate')
    );
  }, [allTransactions]);

  // Agrupa investimentos por tipo (histórico completo para metas) - subtraindo resgates
  const investmentsByTypeAllTime = useMemo(() => {
    const grouped = new Map<InvestmentType, number>();
    
    // Soma aportes
    allInvestmentTransactions.forEach(t => {
      const type = extractInvestmentType(t.description);
      const current = grouped.get(type) || 0;
      grouped.set(type, current + t.value);
    });

    // Subtrai resgates
    allWithdrawalTransactions.forEach(t => {
      const type = extractInvestmentType(t.description);
      const current = grouped.get(type) || 0;
      grouped.set(type, Math.max(0, current - t.value));
    });

    return grouped;
  }, [allInvestmentTransactions, allWithdrawalTransactions]);

  // Agrupa investimentos por tipo (período selecionado) - saldo líquido
  const investmentsByType = useMemo(() => {
    const grouped = new Map<InvestmentType, number>();
    
    // Soma aportes
    investmentTransactions.forEach(t => {
      const type = extractInvestmentType(t.description);
      const current = grouped.get(type) || 0;
      grouped.set(type, current + t.value);
    });

    // Subtrai resgates
    withdrawalTransactions.forEach(t => {
      const type = extractInvestmentType(t.description);
      const current = grouped.get(type) || 0;
      grouped.set(type, Math.max(0, current - t.value));
    });

    return Array.from(grouped.entries())
      .map(([type, value]) => ({
        type,
        name: investmentTypeLabels[type],
        value,
        color: investmentTypeColors[type],
        Icon: investmentTypeIcons[type],
        formatter: displayValue,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [investmentTransactions, withdrawalTransactions, displayValue]);

  // Total investido no período (aportes - resgates)
  const totalInvested = useMemo(() => {
    const aportes = investmentTransactions.reduce((sum, t) => sum + t.value, 0);
    const resgates = withdrawalTransactions.reduce((sum, t) => sum + t.value, 0);
    return Math.max(0, aportes - resgates);
  }, [investmentTransactions, withdrawalTransactions]);

  // Total investido (histórico completo - aportes menos resgates)
  const totalInvestedAllTime = useMemo(() => {
    const aportes = allInvestmentTransactions.reduce((sum, t) => sum + t.value, 0);
    const resgates = allWithdrawalTransactions.reduce((sum, t) => sum + t.value, 0);
    return Math.max(0, aportes - resgates);
  }, [allInvestmentTransactions, allWithdrawalTransactions]);

  // Histórico unificado de movimentações (aportes e resgates)
  const allActivities = useMemo(() => {
    const aportes = investmentTransactions.map(t => ({
      ...t,
      activityType: 'aporte' as const,
    }));
    
    const resgates = withdrawalTransactions.map(t => ({
      ...t,
      activityType: 'resgate' as const,
    }));
    
    let activities = [...aportes, ...resgates];
    
    // Aplicar filtro
    if (activityFilter === 'aporte') {
      activities = aportes;
    } else if (activityFilter === 'resgate') {
      activities = resgates;
    }
    
    return activities.sort((a, b) => b.createdAt - a.createdAt);
  }, [investmentTransactions, withdrawalTransactions, activityFilter]);

  // Paginação
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [allActivities, currentPage, itemsPerPage]);

  // Reset página ao mudar filtro
  const handleFilterChange = (value: 'all' | 'aporte' | 'resgate') => {
    setActivityFilter(value);
    setCurrentPage(1);
  };

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  const handleEditGoal = (type: InvestmentType) => {
    const currentGoal = getGoal(type);
    setEditingGoal(type);
    setGoalInputValue(currentGoal ? formatCurrencyInput((currentGoal * 100).toString()) : '');
  };

  const handleSaveGoal = () => {
    if (editingGoal) {
      const value = parseCurrency(goalInputValue);
      if (value > 0) {
        setGoal(editingGoal, value);
      } else {
        removeGoal(editingGoal);
      }
      setEditingGoal(null);
      setGoalInputValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setGoalInputValue('');
  };

  // Dados das metas com progresso
  const goalsWithProgress = useMemo(() => {
    return allInvestmentTypes.map(type => {
      const invested = investmentsByTypeAllTime.get(type) || 0;
      const target = getGoal(type) || 0;
      const progress = target > 0 ? Math.min((invested / target) * 100, 100) : 0;
      const Icon = investmentTypeIcons[type];
      const color = investmentTypeColors[type];
      
      return {
        type,
        name: investmentTypeLabels[type],
        invested,
        target,
        progress,
        remaining: Math.max(target - invested, 0),
        Icon,
        color,
        hasGoal: target > 0,
      };
    });
  }, [investmentsByTypeAllTime, getGoal]);

  const goalsConfigured = goalsWithProgress.filter(g => g.hasGoal);
  const totalGoalsTarget = goalsConfigured.reduce((sum, g) => sum + g.target, 0);
  const totalGoalsInvested = goalsConfigured.reduce((sum, g) => sum + g.invested, 0);
  const overallProgress = totalGoalsTarget > 0 ? (totalGoalsInvested / totalGoalsTarget) * 100 : 0;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div 
        className="flex items-start justify-between gap-3 mb-6 md:mb-8 opacity-0 animate-fade-in"
        style={{ animationDelay: '0.05s' }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Investimentos</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1 hidden sm:block">Acompanhe seus aportes</p>
        </div>
        <PeriodFilter 
          customRange={customRange}
          onCustomRangeChange={onCustomRangeChange}
          showValues={showValues}
          onToggleValues={onToggleValues}
          hideToggleOnMobile
          customAction={
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 h-9">
                  <ArrowDownToLine className="w-4 h-4" />
                  <span className="hidden sm:inline">Resgatar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Resgatar Investimento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Registre um resgate ou venda de ativo. O valor será adicionado como receita nos lançamentos.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tipo de Investimento</label>
                    <Select value={withdrawType} onValueChange={(v) => setWithdrawType(v as InvestmentType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allInvestmentTypes.map(type => {
                          const Icon = investmentTypeIcons[type];
                          return (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span>{investmentTypeLabels[type]}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Valor do Resgate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={withdrawValue}
                        onChange={e => setWithdrawValue(formatCurrencyInput(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                    <input
                      type="text"
                      value={withdrawDescription}
                      onChange={e => setWithdrawDescription(e.target.value)}
                      placeholder={`Resgate ${investmentTypeLabels[withdrawType]}`}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setIsWithdrawDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 gap-2"
                      onClick={handleWithdraw}
                      disabled={isSubmitting || !withdrawValue}
                    >
                      {isSubmitting ? 'Registrando...' : 'Confirmar Resgate'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-6 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">No Período</p>
              <p className="text-sm md:text-2xl font-bold text-primary truncate">
                {displayValue(totalInvested)}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-6 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-income/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 md:w-6 md:h-6 text-income" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">Total</p>
              <p className="text-sm md:text-2xl font-bold text-income truncate">
                {displayValue(totalInvestedAllTime)}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-6 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center">
              <PieChart className="w-4 h-4 md:w-6 md:h-6 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">Tipos Ativos</p>
              <p className="text-sm md:text-2xl font-bold text-foreground">
                {investmentsByType.length}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="bg-card border border-border rounded-xl p-3 md:p-6 shadow-sm opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">Metas</p>
              <p className="text-sm md:text-2xl font-bold text-foreground">
                {overallProgress.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div 
        className="mb-6 p-4 bg-muted/50 rounded-lg border border-border opacity-0 animate-fade-in"
        style={{ animationDelay: '0.3s' }}
      >
        <p className="text-sm text-muted-foreground">
          💡 <strong>Como funciona:</strong> Os investimentos são identificados automaticamente a partir dos lançamentos com categoria "Investimentos". 
          Na descrição, inclua palavras-chave como "Reserva", "Ações", "FII", "Tesouro", "CDB", "Cripto" para classificação automática.
        </p>
      </div>

      {/* Metas de Investimento */}
      <div 
        className="mb-6 bg-card border border-border rounded-xl p-6 shadow-sm opacity-0 animate-fade-in-up"
        style={{ animationDelay: '0.35s' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Metas de Investimento</h3>
          </div>
          <Dialog open={isGoalsDialogOpen} onOpenChange={setIsGoalsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="w-4 h-4" />
                Editar Metas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Configurar Metas de Investimento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
                {allInvestmentTypes.map(type => {
                  const Icon = investmentTypeIcons[type];
                  const color = investmentTypeColors[type];
                  const currentGoal = getGoal(type);
                  const isEditing = editingGoal === type;
                  
                  return (
                    <div key={type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <span className="font-medium text-foreground">{investmentTypeLabels[type]}</span>
                      </div>
                      
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={goalInputValue}
                              onChange={e => setGoalInputValue(formatCurrencyInput(e.target.value))}
                              placeholder="0,00"
                              className="w-32 pl-9 pr-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={handleSaveGoal}
                            className="p-1.5 text-income hover:bg-income/10 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {currentGoal ? displayValue(currentGoal) : 'Sem meta'}
                          </span>
                          <button
                            onClick={() => handleEditGoal(type)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {goalsConfigured.length > 0 ? (
          <div className="space-y-4">
            {goalsConfigured.map((goal) => {
              const Icon = goal.Icon;
              return (
                <div key={goal.type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: goal.color }} />
                      <span className="text-sm font-medium text-foreground">{goal.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {displayValue(goal.invested)} / {displayValue(goal.target)}
                      </span>
                      <span 
                        className={cn(
                          "font-semibold",
                          goal.progress >= 100 ? "text-income" : "text-primary"
                        )}
                      >
                        {goal.progress.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${goal.progress}%`,
                        backgroundColor: goal.progress >= 100 ? 'hsl(var(--income))' : goal.color,
                      }}
                    />
                  </div>
                  {goal.progress < 100 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Faltam {displayValue(goal.remaining)} para atingir a meta
                    </p>
                  )}
                  {goal.progress >= 100 && (
                    <p className="text-xs text-income mt-1 font-medium">
                      ✓ Meta atingida!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma meta configurada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Editar Metas" para definir seus objetivos
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de distribuição */}
        <div 
          className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit opacity-0 animate-slide-in-left"
          style={{ animationDelay: '0.4s' }}
        >
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
                        <span className="font-medium text-foreground">{displayValue(item.value)}</span>
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

        {/* Histórico de Movimentações */}
        <div 
          className="bg-card border border-border rounded-xl p-6 shadow-sm opacity-0 animate-slide-in-right"
          style={{ animationDelay: '0.45s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Histórico de Movimentações</h3>
            </div>
            <Select value={activityFilter} onValueChange={(v) => handleFilterChange(v as 'all' | 'aporte' | 'resgate')}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as operações</SelectItem>
                <SelectItem value="aporte">Investimento</SelectItem>
                <SelectItem value="resgate">Resgate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {paginatedActivities.length > 0 ? (
            <div className="flex flex-col">
              <div className="divide-y divide-border min-h-[340px]">
              {paginatedActivities.map((activity) => {
                const type = extractInvestmentType(activity.description);
                const [year, month, day] = activity.date.split('-');
                const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                const formattedDate = `${day} de ${months[parseInt(month) - 1]} ${year}`;
                const isResgate = activity.activityType === 'resgate';
                
                // Extrai descrição limpa (remove prefixo "Resgate" se houver)
                const cleanDescription = activity.description
                  .replace(/^Resgate\s*/i, '')
                  .replace(/\s*-\s*$/, '');
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isResgate ? "bg-expense/15" : "bg-income/15"
                    )}>
                      {isResgate ? (
                        <ArrowDownLeft className="w-4 h-4 text-expense" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-income" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-semibold text-sm",
                        isResgate ? "text-expense" : "text-income"
                      )}>
                        {isResgate ? 'Resgate' : 'Investimento'}
                      </p>
                      <p className="text-sm text-foreground truncate">
                        {investmentTypeLabels[type]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formattedDate}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn(
                        "font-semibold text-sm",
                        isResgate ? "text-expense" : "text-income"
                      )}>
                        {isResgate ? '-' : '+'}{displayValue(activity.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
              </div>
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Nenhuma movimentação no período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
