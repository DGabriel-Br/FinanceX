import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { useOverviewMetrics, useTransactionsByDay } from '@/hooks/useAdminMetrics';
import { useAdminPeriod, AdminDateRange } from '@/contexts/AdminPeriodContext';
import { PeriodFilter } from '@/components/finance/PeriodFilter';
import { Loader2, TrendingUp, Users, Percent, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminActivity = () => {
  const { data: metrics, isLoading: metricsLoading } = useOverviewMetrics();
  const { data: transactionsByDay, isLoading: chartLoading } = useTransactionsByDay();
  const { dateRange, setDateRange } = useAdminPeriod();

  const handleRangeChange = (range: { start: Date; end: Date } | null) => {
    setDateRange(range as AdminDateRange | null);
  };

  const isLoading = metricsLoading || chartLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Carregando atividade...</p>
        </div>
      </AdminLayout>
    );
  }

  const percentWithTransactions = metrics?.totalUsers 
    ? Math.round((metrics.activeUsersWithTransactions / metrics.totalUsers) * 100)
    : 0;

  const avgPerUser = metrics?.activeUsersWithTransactions 
    ? (metrics.transactionsInRange / metrics.activeUsersWithTransactions).toFixed(1)
    : '0';

  const chartData = transactionsByDay
    ?.slice(0, 14)
    .reverse()
    .map((item) => ({
      date: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
      transacoes: Number(item.count),
    }));

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
                Atividade Financeira
              </h1>
              <p className="text-muted-foreground">
                Dados agregados de movimentação
              </p>
            </div>
          </div>
          
          <PeriodFilter
            customRange={dateRange}
            onCustomRangeChange={handleRangeChange}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Transações"
            value={metrics?.transactionsInRange ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
            description="No período selecionado"
            variant="primary"
            delay={0}
          />
          <MetricCard
            title="Usuários com Transações"
            value={metrics?.activeUsersWithTransactions ?? 0}
            icon={<Users className="h-5 w-5" />}
            description="Que lançaram no período"
            variant="success"
            delay={100}
          />
          <MetricCard
            title="% com Transações"
            value={`${percentWithTransactions}%`}
            icon={<Percent className="h-5 w-5" />}
            description="Do total de usuários"
            variant="info"
            delay={200}
          />
          <MetricCard
            title="Média por Usuário"
            value={avgPerUser}
            icon={<BarChart3 className="h-5 w-5" />}
            description="Transações por usuário ativo"
            variant="warning"
            delay={300}
          />
        </div>

        <Card className="admin-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              Transações por Dia
            </CardTitle>
            <CardDescription>
              Volume de transações no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="transacoes" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
                <p>Sem dados para exibir no período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminActivity;
