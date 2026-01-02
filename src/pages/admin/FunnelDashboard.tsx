import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { ArrowLeft, Loader2, TrendingDown, Users, ShoppingCart, CreditCard, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface FunnelStep {
  event_name: string;
  count: number;
  label: string;
}

interface FunnelData {
  funnel: FunnelStep[];
  metrics: {
    totalSignups: number;
    checkoutStarted: number;
    checkoutCompleted: number;
  };
  dailyBreakdown: Record<string, Record<string, number>>;
  incomeRanges: Record<string, number>;
  expenseCategories: Record<string, number>;
  projectionOutcomes: {
    positive: number;
    negative: number;
  };
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function FunnelDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState('30');

  // Check admin status
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    const checkAdmin = async () => {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        logger.error('[FunnelDashboard] Error checking admin status:', roleError);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!roleData);
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  // Fetch funnel data
  useEffect(() => {
    if (isAdmin !== true) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: responseData, error: invokeError } = await supabase.functions.invoke(
          `admin-funnel-stats?days=${daysBack}`,
          { method: 'GET' }
        );

        if (invokeError) {
          throw invokeError;
        }

        // Check if response contains an error
        if (responseData?.error) {
          throw new Error(responseData.error);
        }

        setData(responseData as FunnelData);
      } catch (err) {
        logger.error('[FunnelDashboard] Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, daysBack]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  // Calculate drop-off rates
  const funnelWithDropoff = data?.funnel.map((step, index) => {
    const prevCount = index === 0 ? step.count : data.funnel[index - 1].count;
    const dropoffRate = prevCount > 0 ? ((prevCount - step.count) / prevCount) * 100 : 0;
    const conversionRate = data.funnel[0].count > 0 
      ? (step.count / data.funnel[0].count) * 100 
      : 0;
    
    return {
      ...step,
      dropoffRate: dropoffRate.toFixed(1),
      conversionRate: conversionRate.toFixed(1),
    };
  }) || [];

  // Prepare pie chart data for income ranges
  const incomeRangeData = data ? Object.entries(data.incomeRanges).map(([name, value]) => ({
    name: name === '0-1000' ? 'Até R$1k' 
      : name === '1001-3000' ? 'R$1k-3k'
      : name === '3001-5000' ? 'R$3k-5k'
      : name === '5001-10000' ? 'R$5k-10k'
      : name === '10000+' ? '+R$10k'
      : name,
    value,
  })) : [];

  // Prepare pie chart data for expense categories
  const categoryLabels: Record<string, string> = {
    alimentacao: 'Alimentação',
    transporte: 'Transporte',
    moradia: 'Moradia',
    lazer: 'Lazer',
    saude: 'Saúde',
    educacao: 'Educação',
    compras: 'Compras',
    outros: 'Outros',
  };

  const expenseCategoryData = data ? Object.entries(data.expenseCategories).map(([name, value]) => ({
    name: categoryLabels[name] || name,
    value,
  })) : [];

  // Projection outcomes pie
  const projectionData = data ? [
    { name: 'Positivo', value: data.projectionOutcomes.positive, fill: 'hsl(var(--chart-2))' },
    { name: 'Negativo', value: data.projectionOutcomes.negative, fill: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Conversão</h1>
              <p className="text-muted-foreground">Funil de onboarding e métricas de produto</p>
            </div>
          </div>
          
          <Select value={daysBack} onValueChange={setDaysBack}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Top metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Signups</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    {data.metrics.totalSignups}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Checkout Iniciado</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-chart-2" />
                    {data.metrics.checkoutStarted}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Checkout Completo</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-chart-3" />
                    {data.metrics.checkoutCompleted}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Conv. Checkout</CardDescription>
                  <CardTitle className="text-3xl">
                    {data.metrics.checkoutStarted > 0 
                      ? ((data.metrics.checkoutCompleted / data.metrics.checkoutStarted) * 100).toFixed(1)
                      : 0}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Funnel Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Funil de Onboarding
                </CardTitle>
                <CardDescription>
                  Conversão por etapa do onboarding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelWithDropoff} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="label" 
                        width={150}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'count') return [value, 'Usuários'];
                          return [value, name];
                        }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.label}</p>
                              <p className="text-sm">Usuários: <span className="font-bold">{data.count}</span></p>
                              <p className="text-sm">Conv. total: <span className="font-bold">{data.conversionRate}%</span></p>
                              <p className="text-sm text-destructive">Drop-off: <span className="font-bold">{data.dropoffRate}%</span></p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {funnelWithDropoff.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Drop-off summary */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {funnelWithDropoff.slice(1).map((step, index) => (
                    <div key={step.event_name} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        {funnelWithDropoff[index].label.split('. ')[1]} → {step.label.split('. ')[1]}
                      </p>
                      <p className="text-lg font-bold text-destructive">-{step.dropoffRate}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribution charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income ranges */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Faixas de Renda</CardTitle>
                  <CardDescription>Distribuição no onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeRangeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {incomeRangeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Expense categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categorias de Gasto</CardTitle>
                  <CardDescription>1º gasto no onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {expenseCategoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Projection outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resultado da Projeção</CardTitle>
                  <CardDescription>"Sobra" vs "Falta"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {projectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key insight */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">💡 Insight Principal</CardTitle>
              </CardHeader>
              <CardContent>
                {funnelWithDropoff.length > 0 && (
                  <p className="text-muted-foreground">
                    {(() => {
                      const maxDropoff = funnelWithDropoff.slice(1).reduce(
                        (max, step) => parseFloat(step.dropoffRate) > parseFloat(max.dropoffRate) ? step : max,
                        funnelWithDropoff[1]
                      );
                      const maxDropoffIndex = funnelWithDropoff.findIndex(s => s.event_name === maxDropoff.event_name);
                      const prevStep = funnelWithDropoff[maxDropoffIndex - 1];
                      
                      return `O maior drop-off (${maxDropoff.dropoffRate}%) acontece entre "${prevStep?.label.split('. ')[1]}" e "${maxDropoff.label.split('. ')[1]}". 
                        Foco em otimizar essa transição pode aumentar significativamente a conversão do funil.`;
                    })()}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}