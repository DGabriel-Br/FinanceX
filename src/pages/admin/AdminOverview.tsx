import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { useOverviewMetrics } from '@/hooks/useAdminMetrics';
import { useAdminPeriod, AdminDateRange } from '@/contexts/AdminPeriodContext';
import { PeriodFilter } from '@/components/finance/PeriodFilter';
import { 
  Users, 
  UserPlus,
  UserCheck, 
  Percent,
  Receipt, 
  TrendingUp,
  TrendingDown,
  Wallet,
  Shield,
  AlertTriangle,
  Loader2,
  Activity
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

  // Alerta de risco: se há bloqueios no período
  const hasSecurityAlert = (metrics?.usersBlockedInRange ?? 0) > 0;

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

        {/* Alerta de Segurança */}
        {hasSecurityAlert && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-destructive">Atenção: Bloqueios no período</p>
                  <p className="text-sm text-muted-foreground">
                    {metrics?.usersBlockedInRange} usuário(s) bloqueado(s) neste período. Verifique a seção de segurança.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEÇÃO A: Saúde do Produto */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Saúde do Produto
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Usuários"
              value={metrics?.totalUsers ?? 0}
              icon={<Users className="h-5 w-5" />}
              description="Cadastrados na plataforma"
              variant="primary"
              delay={0}
            />
            <MetricCard
              title="Novos no Período"
              value={metrics?.newUsersInRange ?? 0}
              icon={<UserPlus className="h-5 w-5" />}
              description="Cadastros recentes"
              variant="success"
              delay={100}
            />
            <MetricCard
              title="Usuários Ativos"
              value={metrics?.activeUsersInRange ?? 0}
              icon={<UserCheck className="h-5 w-5" />}
              description="Fizeram login no período"
              variant="info"
              delay={200}
            />
            <MetricCard
              title="% Ativos vs Total"
              value={`${metrics?.activeUsersPercentage ?? 0}%`}
              icon={<Percent className="h-5 w-5" />}
              description="Taxa de retenção"
              variant={metrics?.activeUsersPercentage && metrics.activeUsersPercentage >= 50 ? 'success' : 'warning'}
              delay={300}
            />
          </div>
        </div>

        {/* SEÇÃO B: Uso do Core Financeiro */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-income" />
            Uso do Core Financeiro
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Transações"
              value={metrics?.transactionsInRange ?? 0}
              icon={<Receipt className="h-5 w-5" />}
              description="Criadas no período"
              variant="primary"
              delay={400}
            />
            <MetricCard
              title="Média/Usuário"
              value={metrics?.avgTransactionsPerActiveUser ?? 0}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Por usuário ativo"
              variant="info"
              delay={500}
            />
            <MetricCard
              title="Receitas"
              value={formatCurrency(metrics?.totalIncome ?? 0)}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Soma global no período"
              variant="success"
              delay={600}
            />
            <MetricCard
              title="Despesas"
              value={formatCurrency(metrics?.totalExpense ?? 0)}
              icon={<TrendingDown className="h-5 w-5" />}
              description="Soma global no período"
              variant="default"
              delay={700}
            />
            <MetricCard
              title="Resultado"
              value={formatCurrency(metrics?.balance ?? 0)}
              icon={<Wallet className="h-5 w-5" />}
              description="Receitas - Despesas"
              variant={(metrics?.balance ?? 0) >= 0 ? 'success' : 'default'}
              delay={800}
            />
          </div>
        </div>

        {/* SEÇÃO C: Risco e Segurança */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Risco e Segurança
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Usuários Bloqueados"
              value={metrics?.blockedUsersTotal ?? 0}
              icon={<Shield className="h-5 w-5" />}
              description="Total atual"
              variant={(metrics?.blockedUsersTotal ?? 0) > 0 ? 'warning' : 'success'}
              delay={900}
            />
            <MetricCard
              title="Bloqueios no Período"
              value={metrics?.usersBlockedInRange ?? 0}
              icon={<AlertTriangle className="h-5 w-5" />}
              description="Novos bloqueios"
              variant={(metrics?.usersBlockedInRange ?? 0) > 0 ? 'warning' : 'success'}
              delay={1000}
            />
            <MetricCard
              title="Eventos de Auditoria"
              value={metrics?.auditEventsInRange ?? 0}
              icon={<Activity className="h-5 w-5" />}
              description="Registrados no período"
              variant="info"
              delay={1100}
            />
          </div>
        </div>

        {/* Resumo Executivo */}
        <Card className="admin-card-gradient">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              Resumo Executivo
            </CardTitle>
            <CardDescription>
              Resposta rápida às perguntas-chave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">O produto está vivo?</span>
                  <span className={`font-semibold ${(metrics?.transactionsInRange ?? 0) > 0 ? 'text-income' : 'text-destructive'}`}>
                    {(metrics?.transactionsInRange ?? 0) > 0 ? '✓ Sim' : '✗ Sem atividade'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Está crescendo?</span>
                  <span className={`font-semibold ${(metrics?.newUsersInRange ?? 0) > 0 ? 'text-income' : 'text-muted-foreground'}`}>
                    {(metrics?.newUsersInRange ?? 0) > 0 ? `+${metrics?.newUsersInRange} novos usuários` : 'Sem novos cadastros'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Risco imediato?</span>
                  <span className={`font-semibold ${(metrics?.usersBlockedInRange ?? 0) > 0 ? 'text-destructive' : 'text-income'}`}>
                    {(metrics?.usersBlockedInRange ?? 0) > 0 ? `⚠ ${metrics?.usersBlockedInRange} bloqueios` : '✓ Nenhum'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Engajamento</span>
                  <span className={`font-semibold ${(metrics?.activeUsersPercentage ?? 0) >= 30 ? 'text-income' : 'text-warning'}`}>
                    {metrics?.activeUsersPercentage ?? 0}% dos usuários ativos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;