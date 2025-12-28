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
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

const AdminOverview = () => {
  const { data: metrics, isLoading, error } = useOverviewMetrics();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar métricas</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">
            Métricas executivas do FinanceX
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total de Usuários"
            value={metrics?.totalUsers ?? 0}
            icon={<Users className="h-5 w-5" />}
            description="Usuários ativos"
          />
          <MetricCard
            title="Ativos Hoje"
            value={metrics?.activeUsersToday ?? 0}
            icon={<UserCheck className="h-5 w-5" />}
            description="Logins hoje"
          />
          <MetricCard
            title="Ativos (7 dias)"
            value={metrics?.activeUsersWeek ?? 0}
            icon={<Calendar className="h-5 w-5" />}
            description="Última semana"
          />
          <MetricCard
            title="Transações Hoje"
            value={metrics?.transactionsToday ?? 0}
            icon={<Receipt className="h-5 w-5" />}
            description="Criadas hoje"
          />
          <MetricCard
            title="Volume Hoje"
            value={formatCurrency(metrics?.volumeToday ?? 0)}
            icon={<DollarSign className="h-5 w-5" />}
            description="Total movimentado"
          />
          <MetricCard
            title="Eventos de Auditoria"
            value={metrics?.auditEventsToday ?? 0}
            icon={<Shield className="h-5 w-5" />}
            description="Registros hoje"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
