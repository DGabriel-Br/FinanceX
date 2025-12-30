import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { 
  Check, 
  X, 
  ArrowRight, 
  Shield, 
  Smartphone, 
  TrendingUp, 
  Wallet,
  PieChart,
  Lock,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'FinanceX - Veja pra onde seu dinheiro vai';
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - sticky com blur premium */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-16 lg:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5">
              <FinanceLogo size={28} />
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                inanceX
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                asChild 
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex rounded-full px-6">
                <Link to="/cadastro">Começar agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Impactante e limpo */}
        <section className="pt-28 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden">
          {/* Background gradient sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Coluna esquerda - Copy */}
              <ScrollReveal direction="up" duration={600}>
                <div className="max-w-xl lg:max-w-none">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                    Se você não sabe pra onde seu dinheiro vai, 
                    <span className="text-primary"> esse app é pra você.</span>
                  </h1>
                  <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
                    Você anota o que gasta. O app te mostra, de forma clara, se você pode gastar mais ou se precisa parar.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/cadastro')} 
                      className="h-14 px-8 text-base rounded-full"
                    >
                      Começar gratuitamente
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => navigate('/login')} 
                      className="h-14 px-8 text-base rounded-full"
                    >
                      Já tenho conta
                    </Button>
                  </div>
                </div>
              </ScrollReveal>

              {/* Coluna direita - Card visual premium */}
              <ScrollReveal direction="up" delay={200} duration={600}>
                <div className="relative">
                  {/* Card principal com profundidade */}
                  <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-primary/5">
                    {/* Header do card */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Resumo mensal</p>
                        <p className="text-lg font-semibold">Dezembro 2024</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-income/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-income" />
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <div className="space-y-5 mb-8">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-income" />
                          <span className="text-muted-foreground">Entradas</span>
                        </div>
                        <span className="text-xl font-semibold text-income">R$ 5.200,00</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-expense" />
                          <span className="text-muted-foreground">Saídas</span>
                        </div>
                        <span className="text-xl font-semibold text-expense">R$ 3.847,50</span>
                      </div>
                    </div>

                    {/* Saldo destacado */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                      <p className="text-sm text-muted-foreground mb-2">Sobrou este mês</p>
                      <p className="text-3xl font-bold text-primary">R$ 1.352,50</p>
                    </div>
                  </div>

                  {/* Elemento decorativo flutuante */}
                  <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-card border border-border rounded-2xl p-4 shadow-lg hidden sm:block">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-income/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-income" />
                      </div>
                      <span className="text-sm font-medium">Saldo positivo</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Seção Dor - Editorial refinado */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="max-w-3xl">
                <p className="text-primary font-medium mb-4 text-sm tracking-wide uppercase">O problema</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-12 leading-tight">
                  Você já passou por isso?
                </h2>
                
                <div className="space-y-8 text-lg text-muted-foreground">
                  <p className="leading-relaxed">
                    Chega no fim do mês e você não entende. Trabalhou, recebeu, não fez nenhuma loucura... 
                    <span className="text-foreground font-medium"> mas o dinheiro sumiu.</span>
                  </p>
                  <p className="leading-relaxed">
                    Você já tentou planilha. Funcionou por uma semana. Depois virou aquele arquivo que você nem abre mais.
                  </p>
                  <p className="leading-relaxed">
                    Ou baixou um app cheio de função, conectou com banco, configurou categorias... 
                    e desistiu porque era coisa demais.
                  </p>
                </div>

                <div className="mt-12 pl-6 border-l-4 border-primary">
                  <p className="text-xl lg:text-2xl font-semibold text-foreground leading-relaxed">
                    O problema não é você. É que essas soluções complicam algo que deveria ser simples.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Como funciona - Cards horizontais com ícones */}
        <section className="py-20 lg:py-32">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="text-center mb-16">
                <p className="text-primary font-medium mb-4 text-sm tracking-wide uppercase">Simples assim</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Como funciona
                </h2>
              </div>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: Wallet,
                  step: '01',
                  title: 'Você lança o que gastou',
                  description: 'Gastou R$ 45 no mercado? Abre o app, digita, pronto. Menos de 10 segundos.'
                },
                {
                  icon: PieChart,
                  step: '02',
                  title: 'O app organiza pra você',
                  description: 'Categorias prontas. Tudo separado automaticamente. Você não precisa montar nada.'
                },
                {
                  icon: BarChart3,
                  step: '03',
                  title: 'Você vê o que acontece',
                  description: 'Quanto entrou, quanto saiu, quanto sobrou. Claro, direto, sem gráfico complicado.'
                }
              ].map((item, index) => (
                <ScrollReveal key={item.step} direction="up" delay={index * 100} duration={600}>
                  <div className="group relative bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="text-4xl font-bold text-muted-foreground/30">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Para quem é / não é - Visual equilibrado */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="text-center mb-16">
                <p className="text-primary font-medium mb-4 text-sm tracking-wide uppercase">Clareza</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Pra quem é (e pra quem não é)
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
              <ScrollReveal direction="up" delay={0} duration={600}>
                <div className="bg-card border border-border rounded-2xl p-8 lg:p-10 h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-full bg-income/10 flex items-center justify-center">
                      <Check className="w-6 h-6 text-income" />
                    </div>
                    <h3 className="text-xl font-semibold">É pra você se:</h3>
                  </div>
                  <ul className="space-y-5">
                    {[
                      'Você ganha dinheiro mas não sabe pra onde ele vai',
                      'Você quer algo simples que funcione no celular',
                      'Você já desistiu de planilha e de app complicado',
                      'Você quer clareza, não controle obsessivo'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="h-6 w-6 rounded-full bg-income/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-income" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100} duration={600}>
                <div className="bg-card border border-border rounded-2xl p-8 lg:p-10 h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-full bg-expense/10 flex items-center justify-center">
                      <X className="w-6 h-6 text-expense" />
                    </div>
                    <h3 className="text-xl font-semibold">Não é pra você se:</h3>
                  </div>
                  <ul className="space-y-5">
                    {[
                      'Você quer conectar conta bancária automaticamente',
                      'Você precisa de relatórios complexos pra empresa',
                      'Você quer um app gratuito com tudo',
                      'Você já tem um sistema que funciona'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="h-6 w-6 rounded-full bg-expense/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3.5 h-3.5 text-expense" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Preço - Card premium destacado */}
        <section className="py-20 lg:py-32">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="text-center mb-16">
                <p className="text-primary font-medium mb-4 text-sm tracking-wide uppercase">Investimento</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Quanto custa
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100} duration={600}>
              <div className="max-w-md mx-auto">
                <div className="relative bg-card border-2 border-primary/20 rounded-3xl p-8 lg:p-10 shadow-xl shadow-primary/5">
                  {/* Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full">
                      Plano único
                    </span>
                  </div>

                  <div className="text-center pt-4 mb-8">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl lg:text-6xl font-bold">R$ 14,90</span>
                      <span className="text-muted-foreground text-lg">/mês</span>
                    </div>
                    <p className="text-muted-foreground">
                      Cancela quando quiser. Sem multa.
                    </p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {[
                      { icon: Zap, text: 'Lançamentos ilimitados' },
                      { icon: Target, text: 'Controle de dívidas e investimentos' },
                      { icon: Smartphone, text: 'Funciona offline no celular' },
                      { icon: Shield, text: 'Sincroniza entre dispositivos' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                        <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full h-14 text-base rounded-full" 
                    size="lg" 
                    onClick={() => navigate('/planos')}
                  >
                    Assinar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Segurança - Discreto e confiante */}
        <section className="py-20 lg:py-32 bg-muted/30">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Segurança e privacidade
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mt-10">
                  <div className="flex gap-4">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium mb-1">Dados criptografados</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Seus dados ficam criptografados. Ninguém além de você tem acesso.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Smartphone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium mb-1">Funciona offline</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Lance gastos sem internet e sincronize depois.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mt-10 pt-8 border-t border-border text-sm">
                  Não vendemos dados. Não mostramos anúncios. O negócio é simples: você paga, o app funciona.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA final - Impactante */}
        <section className="py-20 lg:py-32">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                  Menos ansiedade,
                  <br />
                  <span className="text-primary">mais clareza.</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                  Comece hoje e veja pra onde seu dinheiro está indo.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')} 
                  className="h-14 px-10 text-base rounded-full"
                >
                  Começar a usar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Footer - Clean e minimalista */}
      <footer className="border-t border-border py-12">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-1.5">
              <FinanceLogo size={24} />
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                inanceX
              </span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground transition-colors">
                Termos de uso
              </Link>
              <Link to="/privacidade" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <a href="mailto:contato@financex.com" className="hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
