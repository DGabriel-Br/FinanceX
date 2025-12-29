import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Check, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  Shield, 
  Smartphone,
  CreditCard,
  Target,
  BarChart3,
  Zap,
  Users
} from 'lucide-react';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

const Landing = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Controle de Receitas e Despesas',
      description: 'Registre todas as suas movimentações financeiras de forma simples e organizada.'
    },
    {
      icon: PieChart,
      title: 'Gráficos Inteligentes',
      description: 'Visualize para onde seu dinheiro está indo com gráficos claros e intuitivos.'
    },
    {
      icon: Target,
      title: 'Metas de Investimento',
      description: 'Defina e acompanhe suas metas financeiras para alcançar seus objetivos.'
    },
    {
      icon: CreditCard,
      title: 'Controle de Dívidas',
      description: 'Gerencie suas dívidas e parcelas em um só lugar.'
    },
    {
      icon: Smartphone,
      title: 'App Nativo',
      description: 'Acesse suas finanças de qualquer lugar com nosso app para celular.'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de ponta a ponta.'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        '50 transações por mês',
        'Categorias padrão',
        'Dashboard básico',
        '1 meta de investimento',
        'Suporte por email'
      ],
      cta: 'Começar Grátis',
      highlighted: false
    },
    {
      name: 'Pro',
      price: 'R$ 29',
      period: '/mês',
      description: 'Para quem leva finanças a sério',
      features: [
        'Transações ilimitadas',
        'Categorias personalizadas',
        'Gráficos avançados',
        'Metas ilimitadas',
        'Controle de dívidas',
        'Exportação Excel/PDF',
        'App mobile completo',
        'Suporte prioritário'
      ],
      cta: 'Assinar Pro',
      highlighted: true
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Empreendedora',
      content: 'Finalmente consigo entender para onde meu dinheiro vai. O Finance+ mudou minha relação com as finanças!',
      avatar: 'MS'
    },
    {
      name: 'João Santos',
      role: 'Desenvolvedor',
      content: 'Interface limpa e funcional. Uso todo dia para registrar meus gastos. Recomendo demais!',
      avatar: 'JS'
    },
    {
      name: 'Ana Costa',
      role: 'Designer',
      content: 'Os gráficos são incríveis! Agora sei exatamente quanto gasto em cada categoria.',
      avatar: 'AC'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <FinanceLogo size={32} />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            Novo: App mobile disponível!
          </div>
          <h1 
            className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in" 
            style={{ animationDelay: '0.1s' } as React.CSSProperties}
          >
            Suas finanças pessoais
            <span className="text-primary block mt-2">sob controle total</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Organize receitas, despesas, investimentos e dívidas em um só lugar. 
            Simples, visual e poderoso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="gap-2 text-lg px-8" asChild>
              <Link to="/cadastro">
                Começar Grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <a href="#features">Ver Recursos</a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>

        {/* Hero Image/Preview */}
        <div className="container mx-auto mt-16 max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-sidebar p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-card to-muted/30">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-background/80 backdrop-blur p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Receitas</p>
                    <p className="text-2xl font-bold text-income">R$ 8.500,00</p>
                  </div>
                  <div className="bg-background/80 backdrop-blur p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-2xl font-bold text-expense">R$ 4.320,00</p>
                  </div>
                  <div className="bg-background/80 backdrop-blur p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-bold text-primary">R$ 4.180,00</p>
                  </div>
                </div>
                <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-24 w-24 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa para
              <span className="text-primary"> organizar suas finanças</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recursos poderosos e fáceis de usar para você ter controle total do seu dinheiro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Escolha o plano ideal para você. Sem surpresas, sem taxas escondidas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-300 h-full ${
                  plan.highlighted 
                    ? 'border-primary shadow-xl' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Mais Popular
                  </div>
                )}
                <CardContent className="p-8 h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-income flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-8" 
                    variant={plan.highlighted ? 'default' : 'outline'}
                    size="lg"
                    asChild
                  >
                    <Link to="/cadastro">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-lg text-muted-foreground">
              Milhares de pessoas já transformaram sua vida financeira com o Finance+
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-border">
                <CardContent className="p-6">
                  <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
            <div className="relative z-10">
              <Users className="h-12 w-12 text-primary-foreground/80 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Pronto para transformar suas finanças?
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de pessoas que já estão no controle do seu dinheiro.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 gap-2"
                asChild
              >
                <Link to="/cadastro">
                  Criar Conta Grátis
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <FinanceLogo size={32} />
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2024 Finance+. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
