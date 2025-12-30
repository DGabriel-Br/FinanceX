import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { Check, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';

// Analytics helper
const trackEvent = (eventName: string) => {
  console.log(`[Analytics] ${eventName}`);
};

export default function Plans() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('plan_view');
    document.title = 'Planos - FinanceX';
  }, []);

  const handleSubscribe = () => {
    trackEvent('subscribe_click');
    
    if (!user) {
      // Redirect to signup with return URL
      navigate('/cadastro?redirect=/planos');
      return;
    }
    
    // For now, show placeholder message
    toast.info('Pagamento em implementação', {
      description: 'Em breve você poderá assinar o FinanceX. Por enquanto, aproveite o acesso gratuito!',
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <FinanceLogo size={28} />
            <span 
              className="text-lg font-black tracking-wider text-foreground"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Escolha seu plano
            </h1>
            <p className="text-muted-foreground">
              Invista menos que um cafezinho por dia no seu controle financeiro
            </p>
          </div>

          {/* Plan Card */}
          <Card className="p-8 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-income to-primary" />
            
            <div className="text-center mb-6">
              <Badge variant="secondary" className="mb-4">Plano Único</Badge>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold">14</span>
                <span className="text-2xl font-bold">,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">Cobrado mensalmente</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {[
                'Lançamentos ilimitados de receitas e despesas',
                'Categorias personalizadas',
                'Controle completo de dívidas',
                'Acompanhamento de investimentos',
                'Funciona 100% offline',
                'Sincronização automática em nuvem',
                'Acesso em múltiplos dispositivos',
                'Suporte por email',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-income flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button className="w-full" size="lg" onClick={handleSubscribe}>
              <CreditCard className="w-4 h-4 mr-2" />
              Assinar agora
            </Button>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Pagamento seguro • Cancele quando quiser</span>
            </div>
          </Card>

          {/* Payment Notice */}
          <Card className="mt-6 p-4 bg-muted/50 border-dashed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Pagamento em implementação</p>
                <p className="text-xs text-muted-foreground">
                  Estamos finalizando a integração com o sistema de pagamentos. 
                  Por enquanto, você pode usar o app gratuitamente!
                </p>
              </div>
            </div>
          </Card>

          {/* Guarantees */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { label: '7 dias', sublabel: 'de garantia' },
              { label: '100%', sublabel: 'seguro' },
              { label: '1 clique', sublabel: 'para cancelar' },
            ].map((item, index) => (
              <div key={index}>
                <p className="text-lg font-bold text-primary">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sublabel}</p>
              </div>
            ))}
          </div>

          {/* Back to app */}
          {user && (
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o app
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
