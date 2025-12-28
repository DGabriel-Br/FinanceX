import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { useFinancialStats, useTransactionsByDay } from '@/hooks/useAdminMetrics';
import { Loader2, TrendingUp, Users, Percent, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { data: stats, isLoading: statsLoading } = useFinancialStats();
  const { data: transactionsByDay, isLoading: chartLoading } = useTransactionsByDay();

  const isLoading = statsLoading || chartLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const percentWithTransactions = stats?.total_users 
    ? Math.round((stats.active_users_with_transactions / stats.total_users) * 100)
    : 0;

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Atividade Financeira</h1>
          <p className="text-muted-foreground mt-1">
            Dados agregados de movimentação
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Transações"
            value={stats?.total_transactions ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
            description="Todas as transações"
          />
          <MetricCard
            title="Usuários com Transações"
            value={stats?.active_users_with_transactions ?? 0}
            icon={<Users className="h-5 w-5" />}
            description="Que já lançaram"
          />
          <MetricCard
            title="% com Transações"
            value={`${percentWithTransactions}%`}
            icon={<Percent className="h-5 w-5" />}
            description="Do total de usuários"
          />
          <MetricCard
            title="Média por Usuário"
            value={stats?.avg_transactions_per_user?.toFixed(1) ?? '0'}
            icon={<BarChart3 className="h-5 w-5" />}
            description="Transações por usuário ativo"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transações por Dia (últimos 14 dias)</CardTitle>
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
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminActivity;
