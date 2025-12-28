import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { useOverviewMetrics } from '@/hooks/useAdminMetrics';
import { useAdminPeriod, AdminDateRange } from '@/contexts/AdminPeriodContext';
import { PeriodFilter } from '@/components/finance/PeriodFilter';
import { 
  Users, 
  UserCheck, 
  Receipt, 
  DollarSign, 
  Shield,
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminOverview = () => {
  const { data: metrics, isLoading, error } = useOverviewMetrics();
  const { dateRange, setDateRange } = useAdminPeriod();

  const handleRangeChange = (range: { start: Date; end: Date } | null) => {
    setDateRange(range as AdminDateRange | null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Carregando métricas...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-destructive font-medium">Erro ao carregar métricas</p>
            <p className="text-sm text-muted-foreground mt-1">Tente novamente mais tarde</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const balance = (metrics?.totalIncome ?? 0) - (metrics?.totalExpense ?? 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Period Filter */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Visão Geral
              </h1>
              <p className="text-muted-foreground">
                Métricas executivas do FinanceX
              </p>
            </div>
          </div>
          
          <PeriodFilter
            customRange={dateRange}
            onCustomRangeChange={handleRangeChange}
          />
        </div>

        {/* Quick Stats Bar */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Resumo do período
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Usuários ativos:</span>
                  <span className="font-semibold text-foreground">{metrics?.activeUsersInRange ?? 0}</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Transações:</span>
                  <span className="font-semibold text-foreground">{metrics?.transactionsInRange ?? 0}</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-semibold text-income">{formatCurrency(metrics?.volumeInRange ?? 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Usuários"
            value={metrics?.totalUsers ?? 0}
            icon={<Users className="h-5 w-5" />}
            description="Usuários cadastrados"
            variant="primary"
            delay={0}
          />
          <MetricCard
            title="Usuários Ativos"
            value={metrics?.activeUsersInRange ?? 0}
            icon={<UserCheck className="h-5 w-5" />}
            description="Fizeram login no período"
            variant="success"
            delay={100}
          />
          <MetricCard
            title="Transações"
            value={metrics?.transactionsInRange ?? 0}
            icon={<Receipt className="h-5 w-5" />}
            description="No período selecionado"
            variant="info"
            delay={200}
          />
          <MetricCard
            title="Eventos de Auditoria"
            value={metrics?.auditEventsInRange ?? 0}
            icon={<Shield className="h-5 w-5" />}
            description="Registros no período"
            variant="warning"
            delay={300}
          />
        </div>

        {/* Financial Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Total de Receitas"
            value={formatCurrency(metrics?.totalIncome ?? 0)}
            icon={<TrendingUp className="h-5 w-5" />}
            description="Entradas no período"
            variant="success"
            delay={400}
          />
          <MetricCard
            title="Total de Despesas"
            value={formatCurrency(metrics?.totalExpense ?? 0)}
            icon={<TrendingDown className="h-5 w-5" />}
            description="Saídas no período"
            variant="default"
            delay={500}
          />
          <MetricCard
            title="Saldo do Período"
            value={formatCurrency(balance)}
            icon={<Wallet className="h-5 w-5" />}
            description="Receitas - Despesas"
            variant={balance >= 0 ? 'success' : 'default'}
            delay={600}
          />
        </div>

        {/* Activity Summary */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="admin-card-gradient">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                Métricas de Engajamento
              </CardTitle>
              <CardDescription>
                Indicadores de uso da plataforma no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Usuários com transações', value: metrics?.activeUsersWithTransactions ?? 0 },
                  { 
                    label: 'Taxa de engajamento', 
                    value: `${metrics?.totalUsers ? Math.round((metrics?.activeUsersWithTransactions / metrics?.totalUsers) * 100) : 0}%` 
                  },
                  { 
                    label: 'Média por usuário ativo', 
                    value: metrics?.activeUsersWithTransactions 
                      ? Math.round((metrics?.transactionsInRange ?? 0) / metrics?.activeUsersWithTransactions) 
                      : 0 
                  },
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 stagger-item"
                    style={{ animationDelay: `${700 + index * 100}ms` }}
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="admin-card-gradient">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-income/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-income" />
                </div>
                Desempenho Financeiro
              </CardTitle>
              <CardDescription>
                Métricas financeiras do período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Volume total', value: formatCurrency(metrics?.volumeInRange ?? 0), positive: true },
                  { label: 'Valor médio por transação', value: formatCurrency(metrics?.avgTransactionValue ?? 0) },
                  { 
                    label: 'Receitas vs Despesas', 
                    value: `${((metrics?.totalIncome ?? 0) / Math.max((metrics?.totalExpense ?? 1), 1) * 100).toFixed(0)}%`,
                    positive: (metrics?.totalIncome ?? 0) > (metrics?.totalExpense ?? 0)
                  },
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 stagger-item"
                    style={{ animationDelay: `${800 + index * 100}ms` }}
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`font-semibold ${item.positive ? 'text-income' : 'text-foreground'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
