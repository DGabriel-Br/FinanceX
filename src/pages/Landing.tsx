import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { 
  ArrowRight, 
  Check, 
  TrendingUp, 
  PieChart, 
  Shield, 
  Smartphone,
  CreditCard,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

const Landing = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Receitas & Despesas',
      description: 'Registre movimentações em segundos. Categorize automaticamente.',
      accent: 'from-emerald-500 to-teal-600'
    },
    {
      icon: PieChart,
      title: 'Visualização Clara',
      description: 'Entenda seus padrões de gasto com gráficos que fazem sentido.',
      accent: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Metas Inteligentes',
      description: 'Defina objetivos e acompanhe seu progresso em tempo real.',
      accent: 'from-violet-500 to-purple-600'
    },
    {
      icon: CreditCard,
      title: 'Controle de Dívidas',
      description: 'Parcelas, juros, vencimentos. Tudo organizado.',
      accent: 'from-orange-500 to-red-600'
    },
    {
      icon: Smartphone,
      title: 'Sempre com Você',
      description: 'App nativo para iOS e Android. Funciona offline.',
      accent: 'from-pink-500 to-rose-600'
    },
    {
      icon: Shield,
      title: 'Privacidade Total',
      description: 'Criptografia de ponta. Seus dados são só seus.',
      accent: 'from-slate-500 to-slate-700'
    }
  ];

  const stats = [
    { value: '12k+', label: 'Usuários ativos' },
    { value: 'R$ 2M+', label: 'Gerenciados/mês' },
    { value: '4.9', label: 'Nota nas lojas' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="relative flex items-end group">
            <FinanceLogo size={28} className="drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <span 
              className="text-lg font-black tracking-wider text-foreground -ml-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="rounded-full px-4" asChild>
              <Link to="/cadastro">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Abstract background shapes */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-5xl relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            {/* Left content */}
            <div className="flex-1 mb-12 lg:mb-0">
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
                Pare de{' '}
                <span 
                  className="italic font-normal"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  adivinhar
                </span>
                <br />
                onde seu dinheiro vai.
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                O FinanceX mostra exatamente como você gasta, ajuda a economizar 
                e transforma suas metas em realidade. Simples assim.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/25" asChild>
                  <Link to="/cadastro">
                    Começar gratuitamente
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full" asChild>
                  <a href="#como-funciona">Ver demonstração</a>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - App preview */}
            {/* Right - iPhone mockup */}
            <div className="flex-1 relative">
              <div className="relative mx-auto max-w-[280px]">
                {/* iPhone frame */}
                <div className="relative bg-[#1a1a1a] rounded-[3rem] p-3 shadow-2xl shadow-black/40">
                  {/* Side buttons - Volume */}
                  <div className="absolute -left-1 top-28 w-1 h-8 bg-[#2a2a2a] rounded-l-sm" />
                  <div className="absolute -left-1 top-40 w-1 h-12 bg-[#2a2a2a] rounded-l-sm" />
                  <div className="absolute -left-1 top-56 w-1 h-12 bg-[#2a2a2a] rounded-l-sm" />
                  {/* Side button - Power */}
                  <div className="absolute -right-1 top-36 w-1 h-16 bg-[#2a2a2a] rounded-r-sm" />
                  
                  {/* Screen */}
                  <div className="bg-background rounded-[2.4rem] overflow-hidden relative">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1a1a1a] rounded-full z-10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#2a2a2a] mr-8" />
                    </div>
                    
                    {/* App content mock */}
                    <div className="pt-12 p-4 space-y-4">
                      {/* Balance card */}
                      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground">
                        <p className="text-xs opacity-80 mb-1">Saldo total</p>
                        <p className="text-2xl font-bold mb-3">R$ 4.180,00</p>
                        <div className="flex gap-4 text-xs">
                          <div>
                            <span className="opacity-70">Receitas</span>
                            <p className="font-semibold">R$ 8.500</p>
                          </div>
                          <div>
                            <span className="opacity-70">Despesas</span>
                            <p className="font-semibold">R$ 4.320</p>
                          </div>
                        </div>
                      </div>

                      {/* Transactions */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Salário</p>
                              <p className="text-xs text-muted-foreground">Hoje</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-income">+R$ 5.200</span>
                        </div>
                        <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">iFood</p>
                              <p className="text-xs text-muted-foreground">Ontem</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-expense">-R$ 48,90</span>
                        </div>
                      </div>

                      {/* Chart placeholder */}
                      <div className="h-24 bg-muted/30 rounded-xl flex items-end justify-around p-3 gap-1">
                        {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-primary/60 rounded-t"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      
                      {/* Home indicator */}
                      <div className="flex justify-center pt-2">
                        <div className="w-32 h-1 bg-foreground/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -left-12 top-1/3 bg-card border border-border rounded-xl p-3 shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-income/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-income" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Meta atingida!</p>
                      <p className="text-[10px] text-muted-foreground">Reserva de emergência</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-primary mb-3">Como funciona</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Três passos para o controle financeiro
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Registre', desc: 'Adicione suas receitas e despesas em poucos toques. Ou importe do Excel.' },
              { step: '02', title: 'Visualize', desc: 'Gráficos mostram para onde seu dinheiro está indo. Sem surpresas.' },
              { step: '03', title: 'Economize', desc: 'Defina metas, acompanhe o progresso e veja seu patrimônio crescer.' }
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 150}>
                <div className="relative">
                  <span className="text-6xl font-bold text-foreground/5 absolute -top-4 -left-2">
                    {item.step}
                  </span>
                  <div className="relative pt-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 2 && (
                    <ChevronRight className="hidden md:block absolute top-1/2 -right-4 h-6 w-6 text-border" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-primary mb-3">Recursos</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
                Tudo que você precisa.
                <br />
                <span className="text-muted-foreground font-normal">Nada que você não precisa.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 100}>
                <div 
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:border-border/80 transition-all duration-300 hover:shadow-lg h-full"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-primary mb-3">Planos</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
                Comece grátis, evolua quando quiser
              </h2>
              <p className="text-muted-foreground">
                Sem surpresas. Sem taxas escondidas. Cancele quando quiser.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <ScrollReveal delay={0}>
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-1">Gratuito</h3>
                  <p className="text-sm text-muted-foreground">Para experimentar sem compromisso</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">R$ 0</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {['50 transações/mês', 'Categorias padrão', 'Dashboard básico', '1 meta de investimento'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="lg" className="w-full rounded-xl" asChild>
                  <Link to="/cadastro">Começar grátis</Link>
                </Button>
              </div>
            </ScrollReveal>

            {/* Pro Plan */}
            <ScrollReveal delay={150}>
              <div className="relative bg-foreground text-background rounded-2xl p-8 flex flex-col h-full">
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                  Popular
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-1">Pro</h3>
                  <p className="text-sm opacity-70">Para quem leva finanças a sério</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">R$ 29</span>
                  <span className="opacity-70">/mês</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {[
                    'Transações ilimitadas',
                    'Categorias personalizadas', 
                    'Gráficos avançados',
                    'Metas ilimitadas',
                    'Controle de dívidas',
                    'Exportação Excel/PDF',
                    'App mobile completo',
                    'Suporte prioritário'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full rounded-xl bg-primary hover:bg-primary/90" asChild>
                  <Link to="/cadastro">Assinar Pro</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <ScrollReveal>
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Sua jornada financeira
              <br />
              <span 
                className="italic font-normal"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                começa agora.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Milhares de pessoas já transformaram sua relação com o dinheiro. 
              Você pode ser a próxima.
            </p>
            <Button size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/25 px-8" asChild>
              <Link to="/cadastro">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Sem cartão de crédito • Configuração em 2 minutos
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative flex items-end group">
              <FinanceLogo size={24} className="drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              <span 
                className="text-base font-black tracking-wider text-foreground -ml-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                inanceX
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2024 FinanceX
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
