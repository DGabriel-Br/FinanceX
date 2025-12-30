import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import {
  Check,
  Zap,
  PieChart,
  Target,
  Wifi,
  WifiOff,
  Shield,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Clock,
  TrendingUp,
  CreditCard,
  X,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// SEO Meta Component
const SEOHead = () => {
  useEffect(() => {
    document.title = 'FinanceX - Controle seu dinheiro em minutos';
    
    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Controle seu dinheiro em minutos, sem planilhas e sem complicação. Registre entradas e saídas em segundos e veja quanto pode gastar.');
    
    // Open Graph
    const ogTags = [
      { property: 'og:title', content: 'FinanceX - Controle seu dinheiro em minutos' },
      { property: 'og:description', content: 'Registre entradas e saídas em segundos e veja, na hora, quanto pode gastar sem entrar em aperto.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.origin },
    ];
    
    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  }, []);
  
  return null;
};

// Analytics helper
const trackEvent = (eventName: string) => {
  // Placeholder for analytics - can integrate with any analytics tool
  console.log(`[Analytics] ${eventName}`);
};

export default function Landing() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('landing_view');
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handlePrimaryCTA = () => {
    trackEvent('cta_click_primary');
    navigate('/cadastro');
  };

  const handleSecondaryCTA = () => {
    trackEvent('cta_click_secondary');
    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubscribe = () => {
    trackEvent('purchase_start');
    navigate('/planos');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead />
      
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" onClick={handlePrimaryCTA}>
              Começar agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            Simples, rápido e sem planilhas
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Pare de se perder
            <br />
            <span className="text-primary">com dinheiro.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Registre entradas e saídas em segundos e veja, na hora, quanto pode gastar sem entrar em aperto.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="w-full sm:w-auto text-base px-8" onClick={handlePrimaryCTA}>
              Começar agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8" onClick={handleSecondaryCTA}>
              Ver como funciona
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Cancele quando quiser • Sem burocracia
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Três passos simples para ter controle total das suas finanças
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Lançou',
                description: 'Registre ganhos e gastos em segundos. É só tocar e digitar.',
                icon: Smartphone,
              },
              {
                step: '2',
                title: 'Organizou',
                description: 'Tudo separado por categoria, automático. Você não precisa fazer nada.',
                icon: PieChart,
              },
              {
                step: '3',
                title: 'Decidiu',
                description: 'Veja seu saldo real e tome decisões melhores sobre seu dinheiro.',
                icon: TrendingUp,
              },
            ].map((item) => (
              <Card key={item.step} className="p-6 text-center relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Você vai conseguir
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Resultados reais, não funcionalidades técnicas
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Clock, text: 'Saber quanto pode gastar hoje' },
              { icon: CreditCard, text: 'Enxergar dívidas e próximos vencimentos' },
              { icon: Target, text: 'Acompanhar metas e aportes sem complicação' },
              { icon: WifiOff, text: 'Usar offline e sincronizar depois' },
              { icon: Zap, text: 'Lançar gastos em menos de 10 segundos' },
              { icon: Shield, text: 'Manter seus dados seguros e privados' },
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 bg-income/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-income" />
                </div>
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Who / Not For Who */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Para quem é (e para quem não é)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-income/30 bg-income/5">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-income">
                <Check className="w-5 h-5" />
                É para você se...
              </h3>
              <ul className="space-y-3">
                {[
                  'Você ganha, mas não sabe para onde o dinheiro vai',
                  'Já tentou planilha e desistiu em uma semana',
                  'Quer algo simples que funcione no celular',
                  'Precisa de clareza para tomar decisões financeiras',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-income mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="p-6 border-expense/30 bg-expense/5">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-expense">
                <X className="w-5 h-5" />
                Não é para você se...
              </h3>
              <ul className="space-y-3">
                {[
                  'Você quer conectar conta bancária automaticamente',
                  'Precisa de relatórios complexos para empresa',
                  'Quer gerenciar finanças de múltiplas pessoas',
                  'Busca um app gratuito com todas as funções',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-expense mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preco" className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Um plano. Um preço.
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Sem surpresas, sem letras miúdas
          </p>
          
          <Card className="p-8 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-income to-primary" />
            
            <div className="text-center mb-6">
              <Badge variant="secondary" className="mb-4">Mais popular</Badge>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-5xl font-bold">14</span>
                <span className="text-2xl font-bold">,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">Menos que um almoço por mês</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {[
                'Lançamentos ilimitados',
                'Categorias personalizadas',
                'Controle de dívidas',
                'Acompanhamento de investimentos',
                'Funciona offline',
                'Sincronização em tempo real',
                'Suporte por email',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-income flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button className="w-full" size="lg" onClick={handleSubscribe}>
              Assinar por R$ 14,90/mês
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              Cancele quando quiser. Sem burocracia, sem planilha, sem dor de cabeça.
            </p>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Perguntas frequentes
          </h2>
          
          <Accordion type="single" collapsible className="space-y-2">
            {[
              {
                question: 'Preciso conectar minha conta bancária?',
                answer: 'Não. O FinanceX funciona com lançamentos manuais - você registra o que entra e o que sai. É simples, rápido e você tem controle total sobre seus dados.',
              },
              {
                question: 'Funciona offline?',
                answer: 'Sim! Você pode usar o app normalmente sem internet. Quando voltar a ter conexão, tudo sincroniza automaticamente.',
              },
              {
                question: 'Posso cancelar quando quiser?',
                answer: 'Com certeza. Você cancela direto no app, sem precisar ligar para ninguém ou mandar email. Sem burocracia.',
              },
              {
                question: 'Meus dados ficam seguros?',
                answer: 'Sim. Usamos criptografia de ponta a ponta e seus dados ficam armazenados de forma segura. Não compartilhamos suas informações com terceiros.',
              },
              {
                question: 'Funciona no iPhone e Android?',
                answer: 'Sim! O FinanceX funciona em qualquer celular pelo navegador, e também temos apps nativos para iOS e Android.',
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-lg border border-border px-4">
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para ter clareza nas suas finanças?
          </h2>
          <p className="text-muted-foreground mb-8">
            Comece agora e veja seu dinheiro de um jeito diferente.
          </p>
          <Button size="lg" className="px-12" onClick={handlePrimaryCTA}>
            Começar agora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <FinanceLogo size={20} />
              <span 
                className="text-sm font-bold tracking-wider text-muted-foreground"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                inanceX
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <a href="mailto:contato@financex.app" className="hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
