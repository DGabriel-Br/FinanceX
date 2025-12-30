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
      <header className="fixed top-0 left-0 right-0 z-50 bg-landing-dark/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="w-full max-w-7xl mx-auto px-5 lg:px-8">
          <div className="h-16 lg:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-end group transition-opacity duration-300 hover:opacity-80">
              <FinanceLogo size={28} className="lg:w-8 lg:h-8" />
              <span 
                className="text-lg lg:text-xl font-black tracking-wider -ml-0.5"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                inanceX
              </span>
            </Link>
            <div className="flex items-center gap-2 lg:gap-3">
              <Button 
                variant="ghost" 
                asChild 
                className="text-white/60 hover:text-white hover:bg-white/[0.04] font-medium text-sm px-3 lg:px-4 transition-all duration-300"
              >
                <Link to="/login">Entrar</Link>
              </Button>
              <Button 
                asChild 
                className="hidden sm:inline-flex rounded-full px-5 lg:px-6 h-9 lg:h-10 bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold text-sm hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all duration-500 border-0"
              >
                <Link to="/cadastro">Começar agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Premium depth with radial gradients */}
        <section className="relative min-h-[100svh] flex items-center pt-16 lg:pt-20 overflow-hidden">
          {/* Background layers for depth */}
          <div className="absolute inset-0">
            {/* Radial gradient vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(45,212,191,0.06),transparent_50%)]" />
            {/* Edge vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(15,23,42,0.4)_100%)]" />
            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative z-10 py-12 lg:py-24">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
              {/* Left content - 7 cols */}
              <div className="lg:col-span-7 lg:pr-8">
                <ScrollReveal direction="up" duration={800}>
                  {/* Headline */}
                  <h1 
                    className="text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold leading-[1.08] tracking-[-0.02em] mb-6 lg:mb-8"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    <span className="text-white/95">Se você não sabe</span>
                    <br />
                    <span className="bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green bg-clip-text text-transparent">
                      pra onde seu dinheiro vai
                    </span>
                  </h1>
                  
                  <p className="text-base lg:text-lg text-white/50 leading-relaxed mb-8 lg:mb-10 max-w-lg">
                    Você anota o que gasta. O app te mostra, de forma clara, se você pode gastar mais ou se precisa parar.
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/cadastro')} 
                      className="h-12 lg:h-14 px-6 lg:px-8 text-sm lg:text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:shadow-[0_0_48px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border-0"
                    >
                      Começar agora
                      <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => navigate('/login')} 
                      className="h-12 lg:h-14 px-6 lg:px-8 text-sm lg:text-base rounded-full bg-white/[0.02] border-white/10 text-white/80 hover:bg-white/[0.06] hover:border-white/20 hover:text-white transition-all duration-300"
                    >
                      Já tenho conta
                    </Button>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right - Dashboard preview - 5 cols with offset */}
              <div className="lg:col-span-5 lg:-mr-8 xl:-mr-16">
                <ScrollReveal direction="up" delay={150} duration={800}>
                  <div className="relative lg:translate-x-4 xl:translate-x-8">
                    {/* Glow effect behind card */}
                    <div className="absolute -inset-8 bg-gradient-to-br from-landing-cyan/15 via-landing-teal/8 to-transparent rounded-[2.5rem] blur-3xl opacity-60" />
                    
                    {/* Main card */}
                    <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl lg:rounded-3xl p-5 lg:p-7 shadow-2xl">
                      {/* Card header */}
                      <div className="flex items-center justify-between mb-6 lg:mb-7">
                        <div>
                          <p className="text-xs text-white/40 mb-1 tracking-wide uppercase">Resumo mensal</p>
                          <p className="text-base lg:text-lg font-semibold text-white/90">
                            {(() => {
                              const date = new Date();
                              const month = date.toLocaleDateString('pt-BR', { month: 'long' });
                              const year = date.getFullYear();
                              return `${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
                            })()}
                          </p>
                        </div>
                        <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl bg-landing-green/15 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-landing-green" />
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="space-y-3 mb-6 lg:mb-7">
                        <div className="flex items-center justify-between p-3.5 lg:p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors duration-300">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-landing-green" />
                            <span className="text-white/50 text-sm">Entradas</span>
                          </div>
                          <span className="text-lg lg:text-xl font-semibold text-landing-green">R$ 5.200,00</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 lg:p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors duration-300">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                            <span className="text-white/50 text-sm">Saídas</span>
                          </div>
                          <span className="text-lg lg:text-xl font-semibold text-red-400">R$ 3.847,50</span>
                        </div>
                      </div>

                      {/* Balance highlight */}
                      <div className="p-4 lg:p-5 rounded-xl bg-gradient-to-br from-landing-cyan/[0.08] to-landing-teal/[0.03] border border-landing-cyan/10">
                        <p className="text-xs text-white/40 mb-1.5 tracking-wide uppercase">Sobrou este mês</p>
                        <p className="text-2xl lg:text-3xl font-bold text-landing-green">
                          R$ 1.352,50
                        </p>
                      </div>
                    </div>

                    {/* Floating badge - refined positioning */}
                    <div className="absolute -top-4 right-4 lg:-top-6 lg:right-0 bg-gradient-to-br from-landing-dark-secondary to-landing-dark backdrop-blur-xl border border-landing-green/20 rounded-full py-2 px-4 lg:py-2.5 lg:px-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hidden sm:flex items-center gap-2.5 hover:scale-105 hover:border-landing-green/40 transition-all duration-500">
                      <div className="h-6 w-6 lg:h-7 lg:w-7 rounded-full bg-landing-green/20 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-landing-green" />
                      </div>
                      <span className="text-xs lg:text-sm font-semibold text-landing-green">Saldo positivo</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section - Light with refined typography */}
        <section className="py-16 lg:py-28 bg-[#f8f9fb] text-landing-dark relative overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Content - 8 cols for asymmetry */}
              <div className="lg:col-span-8">
                <ScrollReveal direction="up" duration={700}>
                  {/* Section label */}
                  <div className="flex items-center gap-3 mb-4 lg:mb-5">
                    <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
                    <span className="text-[11px] lg:text-xs font-semibold tracking-[0.2em] uppercase text-landing-cyan/80">O problema</span>
                  </div>
                  
                  <h2 
                    className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] mb-8 lg:mb-10 leading-tight text-landing-dark/95"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Você já passou por isso?
                  </h2>
                  
                  <div className="space-y-4 lg:space-y-5 text-base lg:text-lg text-landing-dark/55 max-w-2xl">
                    <p className="leading-[1.7]">
                      Chega no fim do mês e você não entende. Trabalhou, recebeu, não fez nenhuma loucura... 
                      <span className="text-landing-dark/90 font-medium"> mas o dinheiro sumiu.</span>
                    </p>
                    <p className="leading-[1.7]">
                      Você já tentou planilha. Funcionou por uma semana. Depois virou aquele arquivo que você nem abre mais.
                    </p>
                    <p className="leading-[1.7]">
                      Ou baixou um app cheio de função, conectou com banco, configurou categorias... 
                      e desistiu porque era coisa demais.
                    </p>
                  </div>

                  <div className="mt-10 lg:mt-12 pl-5 lg:pl-6 border-l-[3px] border-landing-cyan/60">
                    <p 
                      className="text-lg lg:text-xl xl:text-2xl font-semibold text-landing-dark/85 leading-snug"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      O problema não é você. É que essas soluções complicam algo que deveria ser simples.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
              
              {/* Empty column for asymmetry */}
              <div className="hidden lg:block lg:col-span-4" />
            </div>
          </div>
        </section>

        {/* How it Works - Dark with premium depth */}
        <section className="py-16 lg:py-28 bg-landing-dark relative overflow-hidden">
          {/* Multi-layer background for depth */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_20%_40%,rgba(34,211,238,0.06),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_20%,rgba(45,212,191,0.04),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(15,23,42,0.3)_100%)]" />
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative">
            <ScrollReveal direction="up" duration={700}>
              <div className="flex items-center gap-3 mb-4 lg:mb-5">
                <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
                <span className="text-[11px] lg:text-xs font-semibold tracking-[0.2em] uppercase text-landing-cyan/70">Simples assim</span>
              </div>
              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] text-white/95 mb-10 lg:mb-14"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Como funciona
              </h2>
            </ScrollReveal>
            
            {/* Asymmetric grid with varying heights */}
            <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
              {/* Step 1 - Large, taller */}
              <ScrollReveal direction="up" delay={0} duration={700} className="lg:col-span-7">
                <div className="group h-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.06] rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-landing-cyan/20 hover:bg-white/[0.07] transition-all duration-500">
                  <div className="flex items-start justify-between mb-6 lg:mb-8">
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-landing-cyan/15 to-landing-teal/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Wallet className="h-6 w-6 lg:h-7 lg:w-7 text-landing-cyan" />
                    </div>
                    <span className="text-5xl lg:text-6xl font-bold text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500">01</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-white/90 mb-3 lg:mb-4">Você lança o que gastou</h3>
                  <p className="text-white/45 text-base lg:text-lg leading-relaxed">
                    Gastou R$ 45 no mercado? Abre o app, digita, pronto. Menos de 10 segundos.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 2 - Medium, different height */}
              <ScrollReveal direction="up" delay={100} duration={700} className="lg:col-span-5">
                <div className="group h-full bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.06] rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-landing-teal/20 hover:bg-white/[0.06] transition-all duration-500">
                  <div className="flex items-start justify-between mb-6 lg:mb-8">
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-landing-teal/15 to-landing-green/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <PieChart className="h-6 w-6 lg:h-7 lg:w-7 text-landing-teal" />
                    </div>
                    <span className="text-5xl lg:text-6xl font-bold text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500">02</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-white/90 mb-3 lg:mb-4">O app organiza</h3>
                  <p className="text-white/45 text-base lg:text-lg leading-relaxed">
                    Categorias prontas. Tudo separado automaticamente.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 3 - Full width with visual element */}
              <ScrollReveal direction="up" delay={150} duration={700} className="lg:col-span-12">
                <div className="group bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-landing-green/20 transition-all duration-500">
                  <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                    <div>
                      <div className="flex items-start justify-between mb-6 lg:mb-8">
                        <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-landing-green/15 to-landing-cyan/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                          <BarChart3 className="h-6 w-6 lg:h-7 lg:w-7 text-landing-green" />
                        </div>
                        <span className="text-5xl lg:text-6xl font-bold text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500">03</span>
                      </div>
                      <h3 className="text-xl lg:text-2xl font-semibold text-white/90 mb-3 lg:mb-4">Você vê o que acontece</h3>
                      <p className="text-white/45 text-base lg:text-lg leading-relaxed">
                        Quanto entrou, quanto saiu, quanto sobrou. Claro, direto, sem gráfico complicado.
                      </p>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="w-full max-w-xs bg-white/[0.04] rounded-xl lg:rounded-2xl p-5 lg:p-6 border border-white/[0.05] group-hover:border-white/[0.08] transition-colors duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-white/40 text-xs tracking-wide uppercase">Este mês</span>
                          <ArrowUpRight className="h-4 w-4 text-landing-green" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">Alimentação</span>
                            <span className="text-white/90 font-medium">R$ 890</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
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

        {/* For Who Section - Light with refined cards */}
        <section className="py-16 lg:py-28 bg-[#f8f9fb] text-landing-dark relative overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-8">
            <ScrollReveal direction="up" duration={700}>
              <div className="text-center mb-10 lg:mb-14">
                <div className="flex items-center justify-center gap-3 mb-4 lg:mb-5">
                  <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
                  <span className="text-[11px] lg:text-xs font-semibold tracking-[0.2em] uppercase text-landing-cyan/80">Clareza</span>
                  <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
                </div>
                <h2 
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] text-landing-dark/95"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Pra quem é (e pra quem não é)
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
              {/* Offset the second card for asymmetry */}
              <ScrollReveal direction="up" delay={0} duration={700}>
                <div className="bg-white border border-black/[0.04] rounded-2xl lg:rounded-3xl p-6 lg:p-8 h-full shadow-sm hover:shadow-xl hover:shadow-landing-green/[0.03] hover:-translate-y-1 transition-all duration-500">
                  <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-landing-green/10 flex items-center justify-center">
                      <Check className="w-5 h-5 lg:w-6 lg:h-6 text-landing-green" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-landing-dark/90">É pra você se:</h3>
                  </div>
                  <ul className="space-y-4 lg:space-y-5">
                    {[
                      'Você ganha dinheiro mas não sabe pra onde ele vai',
                      'Você quer algo simples que funcione no celular',
                      'Você já desistiu de planilha e de app complicado',
                      'Você quer clareza, não controle obsessivo'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 lg:gap-4 group">
                        <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-landing-green/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-landing-green/15 transition-colors duration-300">
                          <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-landing-green" />
                        </div>
                        <span className="text-landing-dark/55 text-sm lg:text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={80} duration={700}>
                <div className="bg-white border border-black/[0.04] rounded-2xl lg:rounded-3xl p-6 lg:p-8 h-full shadow-sm hover:shadow-xl hover:shadow-red-500/[0.03] hover:-translate-y-1 transition-all duration-500 md:translate-y-4">
                  <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-red-50 flex items-center justify-center">
                      <X className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-landing-dark/90">Não é pra você se:</h3>
                  </div>
                  <ul className="space-y-4 lg:space-y-5">
                    {[
                      'Você quer conectar conta bancária automaticamente',
                      'Você precisa de relatórios complexos pra empresa',
                      'Você quer um app gratuito com tudo',
                      'Você já tem um sistema que funciona'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 lg:gap-4 group">
                        <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-100/60 transition-colors duration-300">
                          <X className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-red-400" />
                        </div>
                        <span className="text-landing-dark/55 text-sm lg:text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Pricing - Dark with layered depth */}
        <section className="py-16 lg:py-28 bg-landing-dark relative overflow-hidden">
          {/* Premium depth layers */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(34,211,238,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(15,23,42,0.4)_100%)]" />
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative">
            <ScrollReveal direction="up" duration={700}>
              <div className="text-center mb-10 lg:mb-14">
                <div className="flex items-center justify-center gap-3 mb-4 lg:mb-5">
                  <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
                  <span className="text-[11px] lg:text-xs font-semibold tracking-[0.2em] uppercase text-landing-cyan/70">Investimento</span>
                  <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
                </div>
                <h2 
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] text-white/95"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Quanto custa
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100} duration={700}>
              <div className="max-w-md mx-auto">
                <div className="relative group">
                  {/* Glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green rounded-[2rem] opacity-15 blur-2xl group-hover:opacity-25 transition-opacity duration-700" />
                  
                  {/* Card */}
                  <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] rounded-2xl lg:rounded-3xl p-6 lg:p-8">
                    {/* Badge */}
                    <div className="absolute -top-3 lg:-top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark text-xs lg:text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                        Plano único
                      </span>
                    </div>

                    <div className="text-center pt-4 lg:pt-5 mb-6 lg:mb-8">
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span 
                          className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white/95"
                          style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                          R$ 14,90
                        </span>
                        <span className="text-white/40 text-base lg:text-lg">/mês</span>
                      </div>
                      <p className="text-white/40 text-sm lg:text-base">
                        Tudo incluso para controlar seu dinheiro com clareza.
                      </p>
                    </div>

                    <div className="space-y-3 mb-8 lg:mb-10">
                      {[
                        { icon: Zap, text: 'Lançamentos ilimitados' },
                        { icon: Target, text: 'Controle de dívidas e investimentos' },
                        { icon: Smartphone, text: 'Funciona offline no celular' },
                        { icon: Shield, text: 'Sincroniza entre dispositivos' }
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 lg:gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors duration-300">
                          <feature.icon className="w-4 h-4 lg:w-5 lg:h-5 text-landing-cyan flex-shrink-0" />
                          <span className="text-white/70 text-sm lg:text-base">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full h-12 lg:h-14 text-sm lg:text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border-0" 
                      size="lg" 
                      onClick={() => navigate('/planos')}
                    >
                      Assinar agora
                      <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Testimonials - Premium section with refined design */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-[#f8f9fb] via-white to-[#f8f9fb] text-landing-dark relative overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-landing-cyan/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-landing-teal/[0.03] rounded-full blur-3xl" />
          </div>

          <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 relative">
            <ScrollReveal direction="up" duration={700}>
              <div className="text-center mb-14 lg:mb-20">
                <div className="flex items-center justify-center gap-3 mb-5 lg:mb-6">
                  <div className="h-px w-8 lg:w-12 bg-gradient-to-r from-transparent to-landing-cyan" />
                  <span className="text-[11px] lg:text-xs font-semibold tracking-[0.25em] uppercase text-landing-cyan">Depoimentos</span>
                  <div className="h-px w-8 lg:w-12 bg-gradient-to-l from-transparent to-landing-cyan" />
                </div>
                <h2 
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] text-landing-dark/95"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  O que nossos usuários dizem
                </h2>
                <p className="text-landing-dark/50 mt-4 max-w-lg mx-auto text-sm lg:text-base">
                  Histórias reais de pessoas que transformaram sua relação com dinheiro
                </p>
              </div>
            </ScrollReveal>

            {/* Two-column masonry-style layout */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Left column */}
              <div className="space-y-6 lg:space-y-8">
                {/* Testimonial 1 - Featured */}
                <ScrollReveal direction="up" delay={0} duration={700}>
                  <div className="group bg-white rounded-2xl lg:rounded-3xl p-7 lg:p-9 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-500 relative border border-black/[0.03] hover:border-landing-cyan/20">
                    {/* Decorative gradient line */}
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-landing-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-landing-cyan to-landing-teal flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-landing-cyan/25 group-hover:shadow-landing-cyan/40 transition-shadow duration-500">
                          RM
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-landing-dark/90">Rafael Mendes</p>
                          <p className="text-landing-dark/45 text-sm">Designer Freelancer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-landing-dark/60 text-base lg:text-lg leading-relaxed">
                      "Eu já tinha desistido de controlar meu dinheiro. Tentei de tudo: planilha, app de banco, 
                      até caderninho. O FinanceX foi o primeiro que realmente funcionou pra mim. 
                      <span className="text-landing-dark/85 font-medium">Em 2 meses eu já sabia exatamente pra onde ia cada centavo.</span>"
                    </blockquote>
                  </div>
                </ScrollReveal>

                {/* Testimonial 3 */}
                <ScrollReveal direction="up" delay={120} duration={700}>
                  <div className="group bg-white rounded-2xl lg:rounded-3xl p-7 lg:p-9 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-500 relative border border-black/[0.03] hover:border-landing-green/20">
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-landing-green/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-landing-green to-landing-cyan flex items-center justify-center text-white font-bold shadow-lg shadow-landing-green/25 group-hover:shadow-landing-green/40 transition-shadow duration-500">
                          PA
                        </div>
                        <div>
                          <p className="font-semibold text-landing-dark/90">Pedro Almeida</p>
                          <p className="text-landing-dark/45 text-sm">Analista de Sistemas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-landing-dark/60 text-base leading-relaxed">
                      "Finalmente consigo ver quanto sobra no mês. 
                      <span className="text-landing-dark/85 font-medium">Agora sei se posso ou não fazer aquela compra.</span>"
                    </blockquote>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right column - offset for masonry effect */}
              <div className="space-y-6 lg:space-y-8 md:pt-12">
                {/* Testimonial 2 */}
                <ScrollReveal direction="up" delay={60} duration={700}>
                  <div className="group bg-white rounded-2xl lg:rounded-3xl p-7 lg:p-9 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-500 relative border border-black/[0.03] hover:border-landing-teal/20">
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-landing-teal/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-landing-teal to-landing-green flex items-center justify-center text-white font-bold shadow-lg shadow-landing-teal/25 group-hover:shadow-landing-teal/40 transition-shadow duration-500">
                          CS
                        </div>
                        <div>
                          <p className="font-semibold text-landing-dark/90">Camila Santos</p>
                          <p className="text-landing-dark/45 text-sm">Professora</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-landing-dark/60 text-base leading-relaxed">
                      "Simples do jeito que deveria ser. Abro, lanço o gasto, fecho. 
                      <span className="text-landing-dark/85 font-medium">Sem complicação.</span>"
                    </blockquote>
                  </div>
                </ScrollReveal>

                {/* Testimonial 4 */}
                <ScrollReveal direction="up" delay={180} duration={700}>
                  <div className="group bg-white rounded-2xl lg:rounded-3xl p-7 lg:p-9 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-500 relative border border-black/[0.03] hover:border-landing-cyan/20">
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-landing-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-landing-cyan to-landing-teal flex items-center justify-center text-white font-bold shadow-lg shadow-landing-cyan/25 group-hover:shadow-landing-cyan/40 transition-shadow duration-500">
                          JL
                        </div>
                        <div>
                          <p className="font-semibold text-landing-dark/90">Juliana Lima</p>
                          <p className="text-landing-dark/45 text-sm">Empreendedora</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-landing-dark/60 text-base leading-relaxed">
                      "O melhor é que funciona offline. Lanço os gastos na hora, mesmo sem internet. 
                      Quando chego em casa, já está tudo sincronizado. <span className="text-landing-dark/85 font-medium">Praticidade total.</span>"
                    </blockquote>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
        {/* Final CTA - Premium gradient depth */}
        <section className="py-20 lg:py-32 bg-landing-dark relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-landing-dark via-landing-dark-secondary/30 to-landing-dark" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(34,211,238,0.08),transparent_60%)]" />
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative">
            <ScrollReveal direction="up" duration={700}>
              <div className="max-w-2xl mx-auto text-center">
                <h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-white/95 mb-5 lg:mb-6"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Menos ansiedade,
                  <br />
                  <span className="bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green bg-clip-text text-transparent">
                    mais clareza.
                  </span>
                </h2>
                <p className="text-base lg:text-lg text-white/50 mb-8 lg:mb-10 max-w-md mx-auto">
                  Comece hoje e veja pra onde seu dinheiro está indo.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')} 
                  className="h-12 lg:h-14 px-8 lg:px-10 text-sm lg:text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:shadow-[0_0_48px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border-0"
                >
                  Começar a usar
                  <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Footer - Dark premium minimal */}
      <footer className="border-t border-white/[0.04] py-10 lg:py-12 bg-landing-dark">
        <div className="w-full max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8">
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/" className="flex items-end group transition-opacity duration-300 hover:opacity-70">
                <FinanceLogo size={24} className="lg:w-7 lg:h-7" />
                <span 
                  className="text-base lg:text-lg font-black tracking-wider -ml-0.5 text-white/90"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  inanceX
                </span>
              </Link>
              <span className="hidden md:inline text-white/20">|</span>
              <span className="hidden md:inline text-xs lg:text-sm text-white/30">
                © {new Date().getFullYear()} Todos os direitos reservados.
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 lg:gap-8">
              <span className="md:hidden text-xs text-white/30">
                © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
              </span>
              <div className="flex items-center gap-6 lg:gap-8 text-xs lg:text-sm text-white/40">
                <Link to="/termos" className="hover:text-white/70 transition-colors duration-300">
                  Termos de uso
                </Link>
                <Link to="/privacidade" className="hover:text-white/70 transition-colors duration-300">
                  Privacidade
                </Link>
                <a href="mailto:contato@financex.com" className="hover:text-white/70 transition-colors duration-300">
                  Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
