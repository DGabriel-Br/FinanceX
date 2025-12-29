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
import mobileDashboardPreview from '@/assets/mobile-dashboard-preview.jpg';
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
        {/* HERO - Design inspirado na referência */}
        <section className="relative overflow-hidden min-h-[100svh] flex items-center">
          {/* Background - Blue for mobile, white for desktop */}
          <div className="absolute inset-0 bg-primary lg:bg-background" />
          
          {/* Desktop: Blue geometric shapes on the right */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%]">
            {/* Main blue background shape */}
            <div className="absolute inset-0 bg-primary" />
            {/* Decorative rounded rectangles */}
            <div className="absolute top-[10%] -left-20 w-[350px] h-[450px] bg-primary-foreground/10 rounded-[3rem] rotate-6 transform-gpu" />
            <div className="absolute top-[15%] -left-10 w-[300px] h-[400px] bg-primary-foreground/5 rounded-[2.5rem] rotate-3 transform-gpu" />
            <div className="absolute bottom-[5%] left-[10%] w-[200px] h-[250px] bg-primary-foreground/8 rounded-[2rem] -rotate-6 transform-gpu" />
          </div>
          
          {/* Mobile: Subtle decorations */}
          <div className="lg:hidden absolute inset-0 overflow-hidden">
            <div className="absolute top-[8%] right-[5%] w-20 h-20 bg-primary-foreground/10 rounded-2xl rotate-12" />
            <div className="absolute bottom-[20%] left-[5%] w-16 h-16 bg-primary-foreground/8 rounded-xl -rotate-6" />
          </div>
          
          <div className="container relative py-12 md:py-24 z-10">
            {/* Mobile Layout */}
            <div className="flex flex-col items-center text-center lg:hidden">
              {/* Decorative line */}
              <div className="w-12 h-1 bg-primary-foreground/50 rounded-full mb-6" />
              
              {/* Title - Mobile */}
              <h1 className="reveal text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] text-primary-foreground mb-4">
                Tenha o controle<br />
                de <span className="text-income">suas finanças</span><br />
                na palma da mão
              </h1>
              
              <p className="reveal text-base sm:text-lg text-primary-foreground/80 max-w-sm mx-auto leading-relaxed mb-6" style={{ animationDelay: '0.1s' }}>
                Monitore seus gastos, faça orçamentos personalizados e defina metas financeiras. Simplifique sua vida financeira!
              </p>
              
              {/* CTA Button - Mobile */}
              <div className="reveal w-full max-w-xs mb-8" style={{ animationDelay: '0.2s' }}>
                <Button size="lg" className="w-full text-base h-14 bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full shadow-xl" asChild>
                  <Link to="/cadastro">
                    Comece agora!
                  </Link>
                </Button>
              </div>
              
              {/* App Store Badges - Mobile */}
              <div className="reveal flex items-center gap-3 mb-10" style={{ animationDelay: '0.3s' }}>
                <a href="#" className="flex items-center gap-2 px-4 py-2.5 bg-foreground/10 border border-primary-foreground/30 rounded-lg hover:bg-foreground/20 transition-colors">
                  <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] text-primary-foreground/70 leading-none">Download on the</p>
                    <p className="text-xs font-semibold text-primary-foreground leading-tight">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2.5 bg-foreground/10 border border-primary-foreground/30 rounded-lg hover:bg-foreground/20 transition-colors">
                  <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] text-primary-foreground/70 leading-none">GET IT ON</p>
                    <p className="text-xs font-semibold text-primary-foreground leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
              
              {/* Phone Mockup - Mobile */}
              <div className="reveal-scale relative" style={{ animationDelay: '0.4s' }}>
                <div className="relative w-[200px] xs:w-[220px] sm:w-[260px]">
                  {/* Phone bezel */}
                  <div className="relative bg-foreground rounded-[2rem] p-1 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                    {/* Screen */}
                    <div className="relative bg-background rounded-[1.7rem] overflow-hidden aspect-[9/19.5]">
                      <img 
                        src={mobileDashboardPreview} 
                        alt="Dashboard do FinanceX" 
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    {/* Home indicator */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-background/50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Layout - Text left, Phone right */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content - Desktop */}
              <div className="space-y-8 text-left pr-8">
                {/* Decorative line */}
                <div className="w-16 h-1.5 bg-primary rounded-full" />
                
                <h1 className="reveal text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
                  Tenha o controle<br />
                  de <span className="text-primary">suas finanças</span><br />
                  na palma da mão
                </h1>
                
                <p className="reveal text-lg xl:text-xl text-muted-foreground max-w-lg leading-relaxed" style={{ animationDelay: '0.1s' }}>
                  Monitore seus gastos, faça orçamentos personalizados e defina metas financeiras. Simplifique sua vida financeira!
                </p>
                
                {/* CTA Button - Desktop */}
                <div className="reveal" style={{ animationDelay: '0.2s' }}>
                  <Button size="lg" variant="outline" className="text-base px-12 h-14 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-all duration-300" asChild>
                    <Link to="/cadastro">
                      Comece agora!
                    </Link>
                  </Button>
                </div>
                
                {/* App Store Badges - Desktop */}
                <div className="reveal flex items-center gap-4 pt-4" style={{ animationDelay: '0.3s' }}>
                  <a href="#" className="flex items-center gap-2 px-5 py-3 bg-foreground border border-border rounded-xl hover:bg-foreground/90 transition-colors">
                    <svg className="w-6 h-6 text-background" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[9px] text-background/70 leading-none">Download on the</p>
                      <p className="text-sm font-semibold text-background leading-tight">App Store</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-2 px-5 py-3 bg-foreground border border-border rounded-xl hover:bg-foreground/90 transition-colors">
                    <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[9px] text-background/70 leading-none">GET IT ON</p>
                      <p className="text-sm font-semibold text-background leading-tight">Google Play</p>
                    </div>
                  </a>
                </div>
              </div>
              
              {/* Right content - Phone mockup Desktop */}
              <div className="reveal-right relative flex justify-center items-center">
                <div className="relative">
                  {/* Phone with shadow */}
                  <div className="relative w-[320px] xl:w-[360px] 2xl:w-[400px]">
                    {/* Phone bezel */}
                    <div className="relative bg-foreground rounded-[2.5rem] p-1.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]">
                      {/* Screen */}
                      <div className="relative bg-background rounded-[2.2rem] overflow-hidden aspect-[9/19.5]">
                        <img 
                          src={mobileDashboardPreview} 
                          alt="Dashboard do FinanceX" 
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      {/* Home indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-background/50 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
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
