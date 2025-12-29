import { Link } from 'react-router-dom';
import { Check, X, Zap, LayoutDashboard, TrendingUp, Shield, PieChart, ArrowRight, Sparkles, Star, Users, Lock, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PublicHeader } from '@/components/landing/PublicHeader';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { useEffect, useRef } from 'react';
import dashboardPreview from '@/assets/dashboard-preview.png';
import transactionsPreview from '@/assets/transactions-preview.png';
import debtsPreview from '@/assets/debts-preview.png';
import investmentsPreview from '@/assets/investments-preview.png';

const LandingPage = () => {
  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />

      <main>
        {/* HERO - Seção com visual impactante estilo mockup */}
        <section className="relative overflow-hidden min-h-[100svh] flex items-center bg-gradient-to-br from-primary via-primary/90 to-primary/80">
          {/* Floating geometric shapes - hidden on mobile for cleaner look */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large background card - desktop only */}
            <div className="hidden md:block absolute top-[10%] right-[5%] w-[400px] h-[500px] bg-primary-foreground/10 rounded-3xl rotate-12 transform-gpu" />
            <div className="hidden md:block absolute top-[15%] right-[10%] w-[350px] h-[450px] bg-primary-foreground/5 rounded-3xl rotate-6 transform-gpu" />
            
            {/* Small floating cards - desktop only */}
            <div className="hidden lg:block absolute top-[20%] left-[5%] w-32 h-32 bg-primary-foreground/10 rounded-2xl -rotate-12 animate-float" />
            <div className="hidden lg:block absolute bottom-[25%] left-[10%] w-24 h-24 bg-income/20 rounded-xl rotate-12 animate-float" style={{ animationDelay: '1s' }} />
            <div className="hidden lg:block absolute top-[60%] right-[5%] w-20 h-20 bg-primary-foreground/15 rounded-lg -rotate-6 animate-float" style={{ animationDelay: '2s' }} />
            
            {/* Mobile subtle decorations */}
            <div className="md:hidden absolute top-[10%] right-[5%] w-16 h-16 bg-primary-foreground/10 rounded-xl rotate-12" />
            <div className="md:hidden absolute bottom-[15%] left-[5%] w-12 h-12 bg-income/15 rounded-lg -rotate-6" />
            
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
          </div>
          
          <div className="container relative py-8 md:py-24">
            {/* Mobile Layout - Stacked and centered */}
            <div className="flex flex-col items-center text-center lg:hidden">
              {/* Phone mockup - Mobile (smaller and centered) */}
              <div className="reveal-scale relative mb-8 mt-4">
                <div className="relative">
                  {/* Glow effect behind phone */}
                  <div className="absolute inset-0 bg-gradient-to-br from-income/30 to-primary-foreground/20 rounded-[2rem] blur-2xl scale-90" />
                  
                  {/* Phone frame - smaller on mobile */}
                  <div className="relative w-[200px] xs:w-[220px] sm:w-[260px]">
                    {/* Phone bezel */}
                    <div className="relative bg-foreground rounded-[2rem] p-1.5 shadow-2xl">
                      {/* Screen */}
                      <div className="relative bg-background rounded-[1.5rem] overflow-hidden">
                        {/* Status bar mockup */}
                        <div className="absolute top-0 left-0 right-0 h-6 bg-sidebar flex items-center justify-center z-10">
                          <div className="w-16 h-4 bg-foreground rounded-full" />
                        </div>
                        
                        {/* App screenshot */}
                        <img 
                          src={dashboardPreview} 
                          alt="Dashboard do FinanceX" 
                          className="w-full h-auto"
                        />
                      </div>
                      
                      {/* Home indicator */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-background/50 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content - Mobile */}
              <div className="space-y-5 px-2">
                <div className="reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" />
                  Controle financeiro simplificado
                </div>
                
                <h1 className="reveal text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-primary-foreground" style={{ animationDelay: '0.1s' }}>
                  Chega de{' '}
                  <span className="relative inline-block">
                    planilha
                    <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="hsl(var(--income))" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </span>
                  .
                </h1>
                
                <p className="reveal text-base sm:text-lg text-primary-foreground/80 max-w-sm mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
                  No FinanceX você lança e pronto. O app organiza e mostra seu mês na hora.
                </p>
                
                <div className="reveal flex flex-col gap-3 pt-2" style={{ animationDelay: '0.3s' }}>
                  <Button size="lg" variant="secondary" className="text-base px-6 h-12 shadow-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 shine-effect group w-full" asChild>
                    <Link to="/cadastro">
                      Criar conta grátis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="text-base px-6 h-12 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground w-full" onClick={() => scrollToSection('#como-funciona')}>
                    Ver como funciona
                  </Button>
                </div>
                
                <div className="reveal flex items-center gap-4 justify-center text-xs text-primary-foreground/70 pt-2" style={{ animationDelay: '0.4s' }}>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-income" />
                    Sem cartão
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-income" />
                    Setup em 30s
                  </span>
                </div>
              </div>
            </div>
            
            {/* Desktop Layout - Side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-center">
              {/* Left content - Desktop */}
              <div className="space-y-8 text-left">
                <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Controle financeiro simplificado
                </div>
                
                <h1 className="reveal text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tight leading-[1.1] text-primary-foreground" style={{ animationDelay: '0.1s' }}>
                  Chega de{' '}
                  <span className="relative inline-block">
                    planilha
                    <svg className="absolute -bottom-2 left-0 w-full h-4 text-income" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </span>
                  .
                </h1>
                
                <p className="reveal text-xl text-primary-foreground/80 max-w-lg leading-relaxed" style={{ animationDelay: '0.2s' }}>
                  No FinanceX você lança e pronto. O app organiza e mostra seu mês na hora.
                </p>
                
                <div className="reveal flex flex-row gap-4" style={{ animationDelay: '0.3s' }}>
                  <Button size="lg" variant="secondary" className="text-base px-8 h-14 shadow-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 shine-effect group" asChild>
                    <Link to="/cadastro">
                      Criar conta grátis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="text-base px-8 h-14 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => scrollToSection('#como-funciona')}>
                    Ver como funciona
                  </Button>
                </div>
                
                <div className="reveal flex items-center gap-6 text-sm text-primary-foreground/70" style={{ animationDelay: '0.4s' }}>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-income" />
                    Sem cartão
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-income" />
                    Setup em 30s
                  </span>
                </div>
              </div>
              
              {/* Right content - Landscape Phone mockup Desktop */}
              <div className="reveal-right relative flex justify-center items-center">
                <div className="relative" style={{ perspective: '1000px' }}>
                  {/* Background decorative cards */}
                  <div className="absolute -top-16 -right-8 w-[280px] h-[180px] bg-primary-foreground/10 rounded-3xl rotate-6 transform-gpu" />
                  <div className="absolute -top-12 -right-4 w-[260px] h-[160px] bg-primary-foreground/5 rounded-2xl rotate-3 transform-gpu" />
                  
                  {/* Glow effect behind phone */}
                  <div className="absolute inset-0 bg-gradient-to-br from-income/40 to-primary-foreground/30 rounded-[2rem] blur-3xl scale-110" />
                  
                  {/* Landscape Phone frame with 3D perspective */}
                  <div 
                    className="relative w-[480px] xl:w-[520px] 2xl:w-[560px] transform-gpu transition-transform duration-700 hover:scale-105"
                    style={{ 
                      transform: 'rotateX(5deg) rotateY(-8deg)',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Phone bezel - landscape orientation */}
                    <div className="relative bg-foreground rounded-[1.5rem] p-1.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)]">
                      {/* Screen */}
                      <div className="relative bg-background rounded-[1.2rem] overflow-hidden">
                        {/* App screenshot */}
                        <img 
                          src={dashboardPreview} 
                          alt="Dashboard do FinanceX" 
                          className="w-full h-auto"
                        />
                      </div>
                      
                      {/* Side button detail (power button) */}
                      <div className="absolute -right-1 top-[30%] w-1 h-8 bg-foreground rounded-r-full" />
                      
                      {/* Volume buttons */}
                      <div className="absolute -right-1 top-[50%] w-1 h-6 bg-foreground rounded-r-full" />
                      <div className="absolute -right-1 top-[62%] w-1 h-6 bg-foreground rounded-r-full" />
                    </div>
                  </div>
                  
                  {/* Floating feature card - Saldo (top left) */}
                  <div 
                    className="absolute -top-6 -left-8 xl:-left-16 bg-card rounded-2xl p-4 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] border border-border/30 backdrop-blur-sm animate-float z-10"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-income/30 to-income/10 flex items-center justify-center shadow-inner">
                        <TrendingUp className="w-5 h-5 text-income" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Saldo</p>
                        <p className="text-base font-bold text-income">+ R$ 2.450</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating feature card - Economia (bottom right) */}
                  <div 
                    className="absolute -bottom-4 -right-4 xl:-right-12 bg-card rounded-2xl p-4 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] border border-border/30 backdrop-blur-sm animate-float z-10" 
                    style={{ animationDelay: '1.5s', transform: 'translateZ(30px)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-inner">
                        <PieChart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Economia</p>
                        <p className="text-base font-bold text-foreground">32% do mês</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator - hidden on very small screens */}
          <div className="hidden sm:block absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-1.5 md:p-2">
              <div className="w-1 h-1.5 md:h-2 bg-primary-foreground/50 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* RECONHECIMENTO - Seção com visual mais dramático */}
        <section className="relative bg-muted/50 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center space-y-12">
              <h2 className="reveal text-3xl md:text-4xl lg:text-5xl font-bold">
                Você sabe <span className="gradient-text">como é</span>.
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                {[
                  'Você começa animado.',
                  'Monta planilha, aba, categoria, gráfico.',
                  'Funciona por um tempo.',
                  'Depois vira trabalho.',
                  'E quando vira trabalho, você para.',
                ].map((text, i) => (
                  <div 
                    key={i} 
                    className={`reveal flex items-start gap-3 p-5 rounded-xl bg-background/80 border border-border/50 backdrop-blur-sm card-hover-lift ${i === 4 ? 'sm:col-span-2' : ''}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground text-lg">{text}</span>
                  </div>
                ))}
              </div>
              
              <div className="reveal pt-8">
                <p className="text-2xl md:text-4xl font-bold">
                  O problema não é você.{' '}
                  <span className="text-expense">É a planilha.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DEMONSTRAÇÃO */}
        <section id="como-funciona" className="py-24 md:py-32 scroll-mt-20 relative">
          <div className="container">
            <div className="max-w-5xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="reveal px-4 py-1.5 text-sm">Como funciona</Badge>
                <h2 className="reveal text-3xl md:text-4xl lg:text-5xl font-bold" style={{ animationDelay: '0.1s' }}>
                  Veja na <span className="gradient-text">prática</span>
                </h2>
                <p className="reveal text-lg text-muted-foreground max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
                  Você lança, o FinanceX organiza e você enxerga. Sem ficar arrumando planilha.
                </p>
              </div>

              {/* Main preview */}
              <div className="reveal-scale relative">
                <div className="absolute inset-8 bg-gradient-to-br from-primary/20 to-income/10 rounded-3xl blur-3xl" />
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-income rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <Card className="relative overflow-hidden shadow-2xl border-0 rounded-2xl">
                    <img 
                      src={dashboardPreview} 
                      alt="Demonstração do dashboard FinanceX" 
                      className="w-full h-auto"
                    />
                  </Card>
                </div>
              </div>

              {/* Feature cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { img: transactionsPreview, title: 'Lançamentos', desc: 'Registre em segundos', icon: Zap },
                  { img: dashboardPreview, title: 'Dashboard', desc: 'Veja seu mês', icon: LayoutDashboard },
                  { img: debtsPreview, title: 'Dívidas', desc: 'Acompanhe o progresso', icon: TrendingUp },
                  { img: investmentsPreview, title: 'Investimentos', desc: 'Alcance suas metas', icon: Rocket },
                ].map((item, i) => (
                  <Card 
                    key={item.title} 
                    className="reveal group overflow-hidden card-hover-lift border-border/50 bg-card/80 backdrop-blur-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="py-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="font-semibold">{item.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA - 3 PASSOS */}
        <section className="bg-muted/30 py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
          
          <div className="container relative">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="reveal text-3xl md:text-4xl lg:text-5xl font-bold">
                  Simples assim
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connection line */}
                <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                
                {[
                  { icon: Zap, title: 'Você anota em segundos', step: '01', desc: 'Lançamento rápido e intuitivo' },
                  { icon: PieChart, title: 'O app organiza sozinho', step: '02', desc: 'Categorização automática' },
                  { icon: LayoutDashboard, title: 'Você vê seu mês na hora', step: '03', desc: 'Dashboard em tempo real' },
                ].map((item, i) => (
                  <div 
                    key={item.step} 
                    className="reveal relative text-center group"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className="relative z-10 mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-xl shadow-primary/25 group-hover:scale-110 group-hover:shadow-primary/40 transition-all duration-300">
                        <item.icon className="w-10 h-10 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MECANISMO ÚNICO */}
        <section className="py-24 md:py-32 relative">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="reveal-left space-y-8">
                  <Badge variant="secondary" className="px-4 py-1.5">Recursos</Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                    Tudo em um <span className="gradient-text">lugar só</span>.
                  </h2>
                  <ul className="space-y-4">
                    {[
                      { text: 'Gastos, entradas e saldo do mês, sem bagunça.', pro: false },
                      { text: 'Dívidas com progresso e previsão de término', pro: true },
                      { text: 'Metas e investimentos com acompanhamento', pro: true },
                      { text: 'Importar e exportar dados', pro: true },
                      { text: 'Backup e sincronização', pro: true },
                    ].map((item, i) => (
                      <li 
                        key={i} 
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-income/10 flex items-center justify-center shrink-0 group-hover:bg-income/20 transition-colors">
                          <Check className="w-5 h-5 text-income" />
                        </div>
                        <span className="flex-1 text-lg">
                          {item.text}
                          {item.pro && <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="reveal-right relative">
                  <div className="absolute inset-4 bg-gradient-to-br from-income/30 to-primary/10 rounded-3xl blur-3xl" />
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-income to-primary rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <Card className="relative overflow-hidden shadow-2xl border-0 rounded-2xl">
                      <img 
                        src={investmentsPreview} 
                        alt="Tela de investimentos e metas" 
                        className="w-full h-auto"
                      />
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARA QUEM É / NÃO É */}
        <section className="bg-muted/30 py-24 md:py-32">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="reveal border-2 border-income/20 hover:border-income/50 transition-all duration-300 card-hover-lift overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-income to-income/50" />
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-income/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Check className="w-7 h-7 text-income" />
                  </div>
                  <CardTitle className="text-2xl">É para você se</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[
                      'quer sair da planilha de vez',
                      'quer entender seus gastos sem complicar',
                      'quer ver o mês de um jeito simples',
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-income mt-1 shrink-0" />
                        <span className="text-muted-foreground text-lg">{text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="reveal border-2 border-expense/20 hover:border-expense/50 transition-all duration-300 card-hover-lift overflow-hidden group" style={{ animationDelay: '0.1s' }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-expense to-expense/50" />
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-expense/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <X className="w-7 h-7 text-expense" />
                  </div>
                  <CardTitle className="text-2xl">Não é para você se</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[
                      'gosta de mexer em fórmula',
                      'quer um monte de gráfico só por enfeite',
                      'prefere sistemas complicados',
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-expense mt-1 shrink-0" />
                        <span className="text-muted-foreground text-lg">{text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="py-24 md:py-32 scroll-mt-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
          
          <div className="container relative">
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="reveal px-4 py-1.5">Planos</Badge>
                <h2 className="reveal text-3xl md:text-4xl lg:text-5xl font-bold" style={{ animationDelay: '0.1s' }}>
                  Escolha o <span className="gradient-text">seu plano</span>
                </h2>
                <p className="reveal text-lg text-muted-foreground" style={{ animationDelay: '0.2s' }}>
                  Comece grátis, evolua quando precisar.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Free */}
                <Card className="reveal relative card-hover-lift bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Free</CardTitle>
                    <CardDescription className="text-base">Para começar e ganhar clareza</CardDescription>
                    <div className="pt-6 pb-2">
                      <span className="text-5xl font-bold">R$ 0</span>
                      <span className="text-muted-foreground text-lg">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <ul className="space-y-4">
                      {['Lançamentos básicos', 'Dashboard do mês', 'Categorias', 'Resumo simples'].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-income/10 flex items-center justify-center">
                            <Check className="w-4 h-4 text-income" />
                          </div>
                          <span className="text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full h-14 text-base" asChild>
                      <Link to="/cadastro">Criar conta grátis</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro */}
                <Card className="reveal relative border-2 border-primary shadow-2xl shadow-primary/20 bg-card overflow-hidden" style={{ animationDelay: '0.1s' }}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-income to-primary" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1.5 shadow-lg bg-gradient-to-r from-primary to-primary/80">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Recomendado
                    </Badge>
                  </div>
                  <CardHeader className="pt-10 pb-2">
                    <CardTitle className="text-2xl">Pro</CardTitle>
                    <CardDescription className="text-base">Para controle total</CardDescription>
                    <div className="pt-6 pb-2">
                      <span className="text-5xl font-bold gradient-text">R$ 19</span>
                      <span className="text-muted-foreground text-lg">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <ul className="space-y-4">
                      {[
                        'Tudo do Free',
                        'Histórico ilimitado',
                        'Dívidas com previsão',
                        'Investimentos e metas',
                        'Importar e exportar',
                        'Backup e sincronização',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-income/10 flex items-center justify-center">
                            <Check className="w-4 h-4 text-income" />
                          </div>
                          <span className="text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full h-14 text-base shadow-xl shadow-primary/30 shine-effect" asChild>
                      <Link to="/cadastro">Assinar Pro</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <p className="reveal text-sm text-muted-foreground text-center">
                Assinatura no cartão. Cancele quando quiser.
              </p>
            </div>
          </div>
        </section>

        {/* CONFIANÇA E PRIVACIDADE */}
        <section className="bg-muted/30 py-24 md:py-32 relative">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="reveal w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-xl shadow-primary/25">
                <Shield className="w-12 h-12 text-primary-foreground" />
              </div>
              <h2 className="reveal text-3xl md:text-4xl lg:text-5xl font-bold" style={{ animationDelay: '0.1s' }}>
                Seus dados são <span className="gradient-text">seus</span>.
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: Lock, title: 'Sem truque', desc: 'Transparência total em tudo' },
                  { icon: Shield, title: 'Privacidade', desc: 'Tratada com seriedade máxima' },
                  { icon: Zap, title: 'Estabilidade', desc: 'Experiência rápida e confiável' },
                ].map((item, i) => (
                  <div 
                    key={item.title} 
                    className="reveal p-8 rounded-2xl bg-background border border-border/50 card-hover-lift"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-income/10 flex items-center justify-center mx-auto mb-6">
                      <item.icon className="w-7 h-7 text-income" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 md:py-32 scroll-mt-20">
          <div className="container">
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="reveal px-4 py-1.5">FAQ</Badge>
                <h2 className="reveal text-3xl md:text-4xl lg:text-5xl font-bold" style={{ animationDelay: '0.1s' }}>
                  Perguntas frequentes
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {[
                  { q: 'O plano Free precisa de cartão?', a: 'Não. Você pode usar o plano gratuito sem precisar cadastrar nenhum método de pagamento.' },
                  { q: 'Posso cancelar o Pro quando quiser?', a: 'Sim. Sem burocracia, sem multa. Cancele direto pelo app.' },
                  { q: 'Funciona no celular e no computador?', a: 'Sim. O FinanceX funciona em qualquer dispositivo com navegador.' },
                  { q: 'Posso importar dados?', a: 'Sim, no plano Pro você pode importar e exportar seus dados em Excel.' },
                  { q: 'O que muda do Free para o Pro?', a: 'O Pro destrava histórico ilimitado, controle de dívidas, metas de investimento, importação/exportação e sincronização em nuvem.' },
                  { q: 'Como começo?', a: 'Crie sua conta grátis em 30 segundos e faça seu primeiro lançamento. É só isso.' },
                ].map((item, i) => (
                  <AccordionItem 
                    key={i} 
                    value={`item-${i}`} 
                    className="reveal bg-muted/30 rounded-xl border px-6 data-[state=open]:bg-muted/50 transition-colors"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <AccordionTrigger className="hover:no-underline py-5 text-left text-lg">{item.q}</AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground text-base">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative overflow-hidden py-24 md:py-32">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-blob" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-income/15 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-income/5" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center space-y-10">
              <h2 className="reveal text-4xl md:text-5xl lg:text-6xl font-bold">
                Chega de <span className="gradient-text">planilha</span>.
              </h2>
              <p className="reveal text-xl md:text-2xl text-muted-foreground" style={{ animationDelay: '0.1s' }}>
                Crie sua conta e veja seu mês na hora.
              </p>
              <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.2s' }}>
                <Button size="lg" className="text-lg px-10 h-16 shadow-xl shadow-primary/30 shine-effect group" asChild>
                  <Link to="/cadastro">
                    Criar conta grátis
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="text-lg px-8 h-16" onClick={() => scrollToSection('#planos')}>
                  Ver planos
                </Button>
              </div>
              
              <div className="reveal flex items-center justify-center gap-8 pt-4" style={{ animationDelay: '0.3s' }}>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-primary border-2 border-background flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-foreground" />
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  <span className="text-foreground font-semibold">+1.000</span> pessoas já usam
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-16 bg-muted/20">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <FinanceLogo size={28} />
                <span className="font-bold text-xl">inanceX</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-8">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors animated-underline">
                  Termos de uso
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors animated-underline">
                  Privacidade
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
