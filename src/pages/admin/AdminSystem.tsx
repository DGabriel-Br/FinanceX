import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { Loader2, Server, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminSystem = () => {
  // For V1, we show basic system health indicators
  // These would connect to real monitoring in future versions

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Status e integridade do sistema
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Erros de Sincronização"
            value={0}
            icon={<RefreshCw className="h-5 w-5" />}
            description="Últimas 24h"
          />
          <MetricCard
            title="Ops Offline Pendentes"
            value={0}
            icon={<Server className="h-5 w-5" />}
            description="Aguardando sync"
          />
          <MetricCard
            title="Retries Anormais"
            value={0}
            icon={<AlertCircle className="h-5 w-5" />}
            description="Acima do esperado"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-income" />
                  <span className="font-medium">Banco de Dados</span>
                </div>
                <Badge className="bg-income">Operacional</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-income" />
                  <span className="font-medium">Autenticação</span>
                </div>
                <Badge className="bg-income">Operacional</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-income" />
                  <span className="font-medium">API</span>
                </div>
                <Badge className="bg-income">Operacional</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-income" />
                  <span className="font-medium">Storage</span>
                </div>
                <Badge className="bg-income">Operacional</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offline/Sync (v1)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O monitoramento detalhado de operações offline será implementado em versões futuras.
              Por enquanto, o sistema registra erros críticos no audit_log.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSystem;
