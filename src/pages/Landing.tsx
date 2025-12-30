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
  BarChart3,
  ArrowUpRight
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
      <div className="min-h-screen bg-landing-dark flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-landing-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-landing-dark text-white overflow-x-hidden">
      {/* Header - Premium glass effect */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-landing-dark/80 backdrop-blur-2xl border-b border-white/5">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-16 lg:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-end group">
              <FinanceLogo size={32} />
              <span 
                className="text-xl font-black tracking-wider -ml-0.5"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                inanceX
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                asChild 
                className="text-white/70 hover:text-white hover:bg-white/5 font-medium"
              >
                <Link to="/login">Entrar</Link>
              </Button>
              <Button 
                asChild 
                className="hidden sm:inline-flex rounded-full px-6 bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:opacity-90 transition-opacity border-0"
              >
                <Link to="/cadastro">Começar agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Dark premium with gradient accents */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            {/* Gradient orbs */}
            <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-landing-cyan/10 blur-[120px]" />
            <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-landing-teal/8 blur-[100px]" />
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-20 lg:py-32">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left content - 7 cols */}
              <div className="lg:col-span-7">
                <ScrollReveal direction="up" duration={600}>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                    <div className="w-2 h-2 rounded-full bg-landing-green animate-pulse" />
                    <span className="text-sm text-white/70 font-medium">Controle financeiro simplificado</span>
                  </div>
                  
                  {/* Headline */}
                  <h1 
                    className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Se você não sabe
                    <br />
                    <span className="bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green bg-clip-text text-transparent">
                      pra onde seu dinheiro vai
                    </span>
                  </h1>
                  
                  <p className="text-lg lg:text-xl text-white/60 leading-relaxed mb-10 max-w-xl">
                    Você anota o que gasta. O app te mostra, de forma clara, se você pode gastar mais ou se precisa parar.
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/cadastro')} 
                      className="h-14 px-8 text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:opacity-90 transition-all border-0 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                    >
                      Começar gratuitamente
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => navigate('/login')} 
                      className="h-14 px-8 text-base rounded-full bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30"
                    >
                      Já tenho conta
                    </Button>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right - Dashboard preview - 5 cols */}
              <div className="lg:col-span-5">
                <ScrollReveal direction="up" delay={200} duration={600}>
                  <div className="relative">
                    {/* Glow effect behind card */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-landing-cyan/20 via-landing-teal/10 to-transparent rounded-3xl blur-2xl" />
                    
                    {/* Main card */}
                    <div className="relative bg-landing-dark-secondary/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8">
                      {/* Card header */}
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-sm text-white/50 mb-1">Resumo mensal</p>
                          <p className="text-lg font-semibold text-white">Dezembro 2024</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-landing-green/20 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-landing-green" />
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-landing-green" />
                            <span className="text-white/60">Entradas</span>
                          </div>
                          <span className="text-xl font-semibold text-landing-green">R$ 5.200,00</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-red-400" />
                            <span className="text-white/60">Saídas</span>
                          </div>
                          <span className="text-xl font-semibold text-red-400">R$ 3.847,50</span>
                        </div>
                      </div>

                      {/* Balance highlight */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-landing-cyan/10 to-landing-teal/5 border border-landing-cyan/20">
                        <p className="text-sm text-white/50 mb-2">Sobrou este mês</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-landing-cyan to-landing-teal bg-clip-text text-transparent">
                          R$ 1.352,50
                        </p>
                      </div>
                    </div>

                    {/* Floating badge */}
                    <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-landing-dark-secondary border border-white/10 rounded-2xl p-3 shadow-2xl hidden sm:flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-landing-green/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-landing-green" />
                      </div>
                      <span className="text-sm font-medium text-white pr-1">Saldo positivo</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section - Light background for contrast */}
        <section className="py-24 lg:py-32 bg-[#f8f9fb] text-landing-dark relative overflow-hidden">
          {/* Subtle pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />
          
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative">
            <ScrollReveal direction="up" duration={600}>
              <div className="max-w-3xl">
                {/* Section label */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-landing-cyan" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-landing-cyan">O problema</span>
                </div>
                
                <h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-12 leading-tight"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Você já passou por isso?
                </h2>
                
                <div className="space-y-6 text-lg text-landing-dark/70">
                  <p className="leading-relaxed">
                    Chega no fim do mês e você não entende. Trabalhou, recebeu, não fez nenhuma loucura... 
                    <span className="text-landing-dark font-semibold"> mas o dinheiro sumiu.</span>
                  </p>
                  <p className="leading-relaxed">
                    Você já tentou planilha. Funcionou por uma semana. Depois virou aquele arquivo que você nem abre mais.
                  </p>
                  <p className="leading-relaxed">
                    Ou baixou um app cheio de função, conectou com banco, configurou categorias... 
                    e desistiu porque era coisa demais.
                  </p>
                </div>

                <div className="mt-12 pl-6 border-l-4 border-landing-cyan">
                  <p 
                    className="text-xl lg:text-2xl font-semibold text-landing-dark leading-relaxed"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    O problema não é você. É que essas soluções complicam algo que deveria ser simples.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How it Works - Dark with asymmetric layout */}
        <section className="py-24 lg:py-32 bg-landing-dark relative overflow-hidden">
          {/* Background accents */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-landing-teal/5 blur-[100px]" />
          
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative">
            <ScrollReveal direction="up" duration={600}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-landing-cyan" />
                <span className="text-sm font-semibold tracking-widest uppercase text-landing-cyan">Simples assim</span>
              </div>
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-16"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Como funciona
              </h2>
            </ScrollReveal>
            
            {/* Asymmetric grid */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Step 1 - Large */}
              <ScrollReveal direction="up" delay={0} duration={600} className="lg:col-span-7">
                <div className="group h-full bg-landing-dark-secondary border border-white/10 rounded-3xl p-8 lg:p-10 hover:border-landing-cyan/30 transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-landing-cyan/20 to-landing-teal/10 flex items-center justify-center">
                      <Wallet className="h-7 w-7 text-landing-cyan" />
                    </div>
                    <span className="text-6xl font-bold text-white/10">01</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Você lança o que gastou</h3>
                  <p className="text-white/60 text-lg leading-relaxed">
                    Gastou R$ 45 no mercado? Abre o app, digita, pronto. Menos de 10 segundos.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 2 - Medium */}
              <ScrollReveal direction="up" delay={100} duration={600} className="lg:col-span-5">
                <div className="group h-full bg-landing-dark-secondary border border-white/10 rounded-3xl p-8 lg:p-10 hover:border-landing-teal/30 transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-landing-teal/20 to-landing-green/10 flex items-center justify-center">
                      <PieChart className="h-7 w-7 text-landing-teal" />
                    </div>
                    <span className="text-6xl font-bold text-white/10">02</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">O app organiza</h3>
                  <p className="text-white/60 text-lg leading-relaxed">
                    Categorias prontas. Tudo separado automaticamente.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 3 - Full width */}
              <ScrollReveal direction="up" delay={200} duration={600} className="lg:col-span-12">
                <div className="group bg-gradient-to-br from-landing-dark-secondary to-landing-dark border border-white/10 rounded-3xl p-8 lg:p-10 hover:border-landing-green/30 transition-all duration-500">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="flex items-start justify-between mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-landing-green/20 to-landing-cyan/10 flex items-center justify-center">
                          <BarChart3 className="h-7 w-7 text-landing-green" />
                        </div>
                        <span className="text-6xl font-bold text-white/10">03</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-4">Você vê o que acontece</h3>
                      <p className="text-white/60 text-lg leading-relaxed">
                        Quanto entrou, quanto saiu, quanto sobrou. Claro, direto, sem gráfico complicado.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-full max-w-sm bg-white/5 rounded-2xl p-6 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-white/50 text-sm">Este mês</span>
                          <ArrowUpRight className="h-4 w-4 text-landing-green" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70">Alimentação</span>
                            <span className="text-white font-medium">R$ 890</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-landing-cyan to-landing-teal rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* For Who Section - Light background */}
        <section className="py-24 lg:py-32 bg-[#f8f9fb] text-landing-dark relative">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-px w-8 bg-landing-cyan" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-landing-cyan">Clareza</span>
                  <div className="h-px w-8 bg-landing-cyan" />
                </div>
                <h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Pra quem é (e pra quem não é)
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <ScrollReveal direction="up" delay={0} duration={600}>
                <div className="bg-white border border-black/5 rounded-3xl p-8 lg:p-10 h-full shadow-sm hover:shadow-lg transition-shadow duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-full bg-landing-green/10 flex items-center justify-center">
                      <Check className="w-6 h-6 text-landing-green" />
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
                        <div className="h-6 w-6 rounded-full bg-landing-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-landing-green" />
                        </div>
                        <span className="text-landing-dark/70 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100} duration={600}>
                <div className="bg-white border border-black/5 rounded-3xl p-8 lg:p-10 h-full shadow-sm hover:shadow-lg transition-shadow duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                      <X className="w-6 h-6 text-red-400" />
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
                        <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="text-landing-dark/70 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Pricing - Dark with gradient accent */}
        <section className="py-24 lg:py-32 bg-landing-dark relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-landing-cyan/5 blur-[120px]" />
          
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative">
            <ScrollReveal direction="up" duration={600}>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-px w-8 bg-landing-cyan" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-landing-cyan">Investimento</span>
                  <div className="h-px w-8 bg-landing-cyan" />
                </div>
                <h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Quanto custa
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100} duration={600}>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  {/* Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green rounded-3xl opacity-20 blur-xl" />
                  
                  {/* Card */}
                  <div className="relative bg-landing-dark-secondary border border-white/10 rounded-3xl p-8 lg:p-10">
                    {/* Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark text-sm font-semibold px-4 py-1.5 rounded-full">
                        Plano único
                      </span>
                    </div>

                    <div className="text-center pt-4 mb-8">
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span 
                          className="text-5xl lg:text-6xl font-bold text-white"
                          style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                          R$ 14,90
                        </span>
                        <span className="text-white/50 text-lg">/mês</span>
                      </div>
                      <p className="text-white/50">
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
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                          <feature.icon className="w-5 h-5 text-landing-cyan flex-shrink-0" />
                          <span className="text-white/80">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full h-14 text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:opacity-90 transition-all border-0" 
                      size="lg" 
                      onClick={() => navigate('/planos')}
                    >
                      Assinar agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Security - Light */}
        <section className="py-24 lg:py-32 bg-[#f8f9fb] text-landing-dark">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={600}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-landing-cyan/10 to-landing-teal/5 flex items-center justify-center">
                    <Lock className="h-7 w-7 text-landing-cyan" />
                  </div>
                  <h2 
                    className="text-2xl sm:text-3xl font-bold tracking-tight"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Segurança e privacidade
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 mt-10 text-left">
                  <div className="flex gap-4 justify-center sm:justify-start">
                    <div className="h-10 w-10 rounded-xl bg-landing-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-landing-cyan" />
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Dados criptografados</p>
                      <p className="text-landing-dark/60 leading-relaxed">
                        Seus dados ficam criptografados. Ninguém além de você tem acesso.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center sm:justify-start">
                    <div className="h-10 w-10 rounded-xl bg-landing-teal/10 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5 text-landing-teal" />
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Funciona offline</p>
                      <p className="text-landing-dark/60 leading-relaxed">
                        Lance gastos sem internet e sincronize depois.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-landing-dark/50 mt-12 pt-8 border-t border-black/5">
                  Não vendemos dados. Não mostramos anúncios. O negócio é simples: você paga, o app funciona.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA - Dark gradient */}
        <section className="py-24 lg:py-32 bg-landing-dark relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-t from-landing-dark via-landing-dark-secondary/50 to-landing-dark" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-landing-cyan/10 blur-[100px]" />
          
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative">
            <ScrollReveal direction="up" duration={600}>
              <div className="max-w-2xl mx-auto text-center">
                <h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Menos ansiedade,
                  <br />
                  <span className="bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green bg-clip-text text-transparent">
                    mais clareza.
                  </span>
                </h2>
                <p className="text-lg text-white/60 mb-10 max-w-md mx-auto">
                  Comece hoje e veja pra onde seu dinheiro está indo.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')} 
                  className="h-14 px-10 text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:opacity-90 transition-all border-0 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                >
                  Começar a usar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Footer - Dark premium */}
      <footer className="border-t border-white/5 py-12 bg-landing-dark">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-end">
              <FinanceLogo size={28} />
              <span 
                className="text-lg font-black tracking-wider -ml-0.5 text-white"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                inanceX
              </span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-white/50">
              <Link to="/termos" className="hover:text-white transition-colors">
                Termos de uso
              </Link>
              <Link to="/privacidade" className="hover:text-white transition-colors">
                Privacidade
              </Link>
              <a href="mailto:contato@financex.com" className="hover:text-white transition-colors">
                Contato
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
