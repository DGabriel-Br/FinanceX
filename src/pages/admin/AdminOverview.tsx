import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { useOverviewMetrics } from '@/hooks/useAdminMetrics';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Receipt, 
  DollarSign, 
  Shield,
  Loader2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminOverview = () => {
  const { data: metrics, isLoading, error } = useOverviewMetrics();

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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
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
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-income/10 text-income text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-income animate-pulse" />
            Sistema Operacional
          </div>
        </div>

        {/* Quick Stats Bar */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Resumo rápido do dia
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Usuários ativos:</span>
                  <span className="font-semibold text-foreground">{metrics?.activeUsersToday ?? 0}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Transações:</span>
                  <span className="font-semibold text-foreground">{metrics?.transactionsToday ?? 0}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-semibold text-income">{formatCurrency(metrics?.volumeToday ?? 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total de Usuários"
            value={metrics?.totalUsers ?? 0}
            icon={<Users className="h-5 w-5" />}
            description="Usuários cadastrados na plataforma"
            variant="primary"
            delay={0}
          />
          <MetricCard
            title="Ativos Hoje"
            value={metrics?.activeUsersToday ?? 0}
            icon={<UserCheck className="h-5 w-5" />}
            description="Usuários que fizeram login hoje"
            variant="success"
            delay={100}
          />
          <MetricCard
            title="Ativos (7 dias)"
            value={metrics?.activeUsersWeek ?? 0}
            icon={<Calendar className="h-5 w-5" />}
            description="Usuários ativos na última semana"
            variant="info"
            delay={200}
          />
          <MetricCard
            title="Transações Hoje"
            value={metrics?.transactionsToday ?? 0}
            icon={<Receipt className="h-5 w-5" />}
            description="Transações criadas hoje"
            variant="default"
            delay={300}
          />
          <MetricCard
            title="Volume Hoje"
            value={formatCurrency(metrics?.volumeToday ?? 0)}
            icon={<DollarSign className="h-5 w-5" />}
            description="Total movimentado hoje"
            variant="success"
            delay={400}
          />
          <MetricCard
            title="Eventos de Auditoria"
            value={metrics?.auditEventsToday ?? 0}
            icon={<Shield className="h-5 w-5" />}
            description="Registros de auditoria hoje"
            variant="warning"
            delay={500}
          />
        </div>

        {/* Activity Summary */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="admin-card-gradient">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Resumo das atividades mais recentes do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Novos usuários esta semana', value: metrics?.activeUsersWeek ?? 0 },
                  { label: 'Taxa de engajamento', value: `${metrics?.totalUsers ? Math.round((metrics?.activeUsersToday / metrics?.totalUsers) * 100) : 0}%` },
                  { label: 'Eventos de segurança', value: metrics?.auditEventsToday ?? 0 },
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 stagger-item"
                    style={{ animationDelay: `${600 + index * 100}ms` }}
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
                Métricas financeiras do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Volume total hoje', value: formatCurrency(metrics?.volumeToday ?? 0), positive: true },
                  { label: 'Transações processadas', value: metrics?.transactionsToday ?? 0 },
                  { label: 'Média por transação', value: formatCurrency(metrics?.transactionsToday ? (metrics?.volumeToday ?? 0) / metrics?.transactionsToday : 0) },
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 stagger-item"
                    style={{ animationDelay: `${700 + index * 100}ms` }}
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
