import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { useRecentAuditEvents, useOverviewMetrics } from '@/hooks/useAdminMetrics';
import { useAdminPeriod, AdminDateRange } from '@/contexts/AdminPeriodContext';
import { PeriodFilter } from '@/components/finance/PeriodFilter';
import { Loader2, Shield, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const { dateRange, setDateRange } = useAdminPeriod();

  const handleRangeChange = (range: { start: Date; end: Date } | null) => {
    setDateRange(range as AdminDateRange | null);
  };

  const isLoading = metricsLoading || eventsLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Carregando segurança...</p>
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
        {/* Header with Period Filter */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Segurança
              </h1>
              <p className="text-muted-foreground">
                Monitoramento e eventos de auditoria
              </p>
            </div>
          </div>
          
          <PeriodFilter
            customRange={dateRange}
            onCustomRangeChange={handleRangeChange}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Eventos de Auditoria"
            value={metrics?.auditEventsInRange ?? 0}
            icon={<Shield className="h-5 w-5" />}
            description="No período selecionado"
            variant="primary"
            delay={0}
          />
          <MetricCard
            title="Usuários Ativos"
            value={metrics?.activeUsersInRange ?? 0}
            icon={<Activity className="h-5 w-5" />}
            description="Com login no período"
            variant="success"
            delay={100}
          />
          <MetricCard
            title="Alertas"
            value={0}
            icon={<AlertTriangle className="h-5 w-5" />}
            description="Sem alertas críticos"
            variant="warning"
            delay={200}
          />
        </div>

        <Card className="admin-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              Últimos 20 Eventos de Auditoria
            </CardTitle>
            <CardDescription>
              Registro de alterações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Campos Alterados</TableHead>
                    <TableHead className="hidden md:table-cell">ID Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEvents?.map((event, index) => (
                    <TableRow 
                      key={event.id}
                      className="stagger-item hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
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
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Shield className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">Nenhum evento de auditoria registrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
