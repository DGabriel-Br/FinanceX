import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { useRecentAuditEvents, useOverviewMetrics, AuditEvent } from '@/hooks/useAdminMetrics';
import { Loader2, Shield, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getActionBadge = (action: string) => {
  switch (action) {
    case 'INSERT':
      return <Badge className="bg-income">INSERT</Badge>;
    case 'UPDATE':
      return <Badge variant="secondary">UPDATE</Badge>;
    case 'DELETE':
      return <Badge variant="destructive">DELETE</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
};

const AdminSecurity = () => {
  const { data: metrics, isLoading: metricsLoading } = useOverviewMetrics();
  const { data: auditEvents, isLoading: eventsLoading } = useRecentAuditEvents(20);

  const isLoading = metricsLoading || eventsLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM HH:mm:ss', { locale: ptBR });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Segurança</h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento e eventos de auditoria
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Eventos de Auditoria Hoje"
            value={metrics?.auditEventsToday ?? 0}
            icon={<Shield className="h-5 w-5" />}
            description="Total de registros"
          />
          <MetricCard
            title="Usuários Ativos Hoje"
            value={metrics?.activeUsersToday ?? 0}
            icon={<Activity className="h-5 w-5" />}
            description="Sessões ativas"
          />
          <MetricCard
            title="Alertas"
            value={0}
            icon={<AlertTriangle className="h-5 w-5" />}
            description="Sem alertas críticos"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Últimos 20 Eventos de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Campos Alterados</TableHead>
                  <TableHead className="hidden md:table-cell">ID Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditEvents?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(event.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.table_name}</Badge>
                    </TableCell>
                    <TableCell>{getActionBadge(event.action)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.changed_fields?.join(', ') || '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                      {event.user_id?.slice(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))}
                {(!auditEvents || auditEvents.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum evento de auditoria registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
