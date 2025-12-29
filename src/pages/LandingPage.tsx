import { Link } from 'react-router-dom';
import { Check, X, Zap, LayoutDashboard, TrendingUp, Shield, PieChart, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PublicHeader } from '@/components/landing/PublicHeader';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />

      <main>
        {/* HERO - Seção com gradiente e visual impactante */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-income/5" />
          <div className="absolute top-20 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-income/10 rounded-full blur-3xl" />
          
          <div className="container relative py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Controle financeiro simplificado
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  Chega de{' '}
                  <span className="text-primary relative">
                    planilha
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </span>
                  .
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                  No FinanceX você lança e pronto. O app organiza e mostra seu mês na hora.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25" asChild>
                    <Link to="/cadastro">
                      Criar conta grátis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => scrollToSection('#como-funciona')}>
                    Ver como funciona
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center lg:justify-start">
                  <Check className="w-4 h-4 text-income" />
                  Sem cartão no Free
                </p>
              </div>
              
              {/* Hero Image com efeito de profundidade */}
              <div className="relative">
                <div className="absolute inset-4 bg-gradient-to-br from-primary/20 to-income/20 rounded-2xl blur-2xl" />
                <Card className="relative overflow-hidden shadow-2xl border-0 bg-card/80 backdrop-blur">
                  <img 
                    src={dashboardPreview} 
                    alt="Dashboard do FinanceX mostrando resumo financeiro mensal" 
                    className="w-full h-auto"
                  />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* RECONHECIMENTO - Seção com visual mais dramático */}
        <section className="bg-muted/50 py-20 md:py-28">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Você sabe <span className="text-primary">como é</span>.
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
                    className={`flex items-start gap-3 p-4 rounded-lg bg-background/80 border border-border/50 ${i === 4 ? 'sm:col-span-2' : ''}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6">
                <p className="text-2xl md:text-3xl font-bold">
                  O problema não é você.{' '}
                  <span className="text-expense">É a planilha.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DEMONSTRAÇÃO */}
        <section id="como-funciona" className="py-20 md:py-28 scroll-mt-20">
          <div className="container">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="px-4 py-1.5">Como funciona</Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  Veja na <span className="text-primary">prática</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Você lança, o FinanceX organiza e você enxerga. Sem ficar arrumando planilha.
                </p>
              </div>

              {/* Main preview */}
              <div className="relative">
                <div className="absolute inset-4 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-2xl" />
                <Card className="relative overflow-hidden shadow-xl">
                  <img 
                    src={dashboardPreview} 
                    alt="Demonstração do dashboard FinanceX" 
                    className="w-full h-auto"
                  />
                </Card>
              </div>

              {/* Feature cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { img: transactionsPreview, title: 'Lançamentos', desc: 'Registre em segundos' },
                  { img: dashboardPreview, title: 'Dashboard', desc: 'Veja seu mês' },
                  { img: debtsPreview, title: 'Dívidas', desc: 'Acompanhe o progresso' },
                  { img: investmentsPreview, title: 'Investimentos', desc: 'Alcance suas metas' },
                ].map((item) => (
                  <Card key={item.title} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-muted overflow-hidden">
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="py-4">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA - 3 PASSOS */}
        <section className="bg-muted/50 py-20 md:py-28">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Simples assim
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Zap, title: 'Você anota em segundos', step: '01' },
                  { icon: PieChart, title: 'O app organiza sozinho', step: '02' },
                  { icon: LayoutDashboard, title: 'Você vê seu mês na hora', step: '03' },
                ].map((item) => (
                  <div key={item.step} className="relative text-center group">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl font-black text-primary/10 select-none">
                      {item.step}
                    </div>
                    <div className="relative pt-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MECANISMO ÚNICO */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Tudo em um <span className="text-primary">lugar só</span>.
                  </h2>
                  <ul className="space-y-4">
                    {[
                      { text: 'Gastos, entradas e saldo do mês, sem bagunça.', pro: false },
                      { text: 'Dívidas com progresso e previsão de término', pro: true },
                      { text: 'Metas e investimentos com acompanhamento', pro: true },
                      { text: 'Importar e exportar dados', pro: true },
                      { text: 'Backup e sincronização', pro: true },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-income/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-income" />
                        </div>
                        <span className="flex-1">
                          {item.text}
                          {item.pro && <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-4 bg-gradient-to-br from-income/20 to-primary/10 rounded-2xl blur-2xl" />
                  <Card className="relative overflow-hidden shadow-xl">
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
        </section>

        {/* PARA QUEM É / NÃO É */}
        <section className="bg-muted/50 py-20 md:py-28">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 border-income/20 hover:border-income/40 transition-colors">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center mb-2">
                    <Check className="w-6 h-6 text-income" />
                  </div>
                  <CardTitle className="text-xl">É para você se</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      'quer sair da planilha',
                      'quer entender seus gastos sem complicar',
                      'quer ver o mês de um jeito simples',
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-expense/20 hover:border-expense/40 transition-colors">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center mb-2">
                    <X className="w-6 h-6 text-expense" />
                  </div>
                  <CardTitle className="text-xl">Não é para você se</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      'gosta de mexer em fórmula',
                      'quer um monte de gráfico só por enfeite',
                      'prefere sistemas complicados',
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-expense mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="py-20 md:py-28 scroll-mt-20">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="px-4 py-1.5">Planos</Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  Escolha o <span className="text-primary">seu plano</span>
                </h2>
                <p className="text-muted-foreground">Comece grátis, evolua quando precisar.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Free */}
                <Card className="relative hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-2xl">Free</CardTitle>
                    <CardDescription className="text-base">Para começar e ganhar clareza</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">R$ 0</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {['Lançamentos básicos', 'Dashboard do mês', 'Categorias', 'Resumo simples'].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-income shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full h-12 text-base" asChild>
                      <Link to="/cadastro">Criar conta grátis</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro */}
                <Card className="relative border-2 border-primary shadow-lg shadow-primary/10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1.5 shadow-lg">Recomendado</Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl">Pro</CardTitle>
                    <CardDescription className="text-base">Para controle total</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">R$ 19</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {[
                        'Tudo do Free',
                        'Histórico ilimitado',
                        'Dívidas com previsão',
                        'Investimentos e metas',
                        'Importar e exportar',
                        'Backup e sincronização',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-income shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full h-12 text-base shadow-lg shadow-primary/25" asChild>
                      <Link to="/cadastro">Assinar Pro</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Assinatura no cartão. Cancele quando quiser.
              </p>
            </div>
          </div>
        </section>

        {/* CONFIANÇA E PRIVACIDADE */}
        <section className="bg-muted/50 py-20 md:py-28">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Seus dados são <span className="text-primary">seus</span>.
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { title: 'Sem truque', desc: 'Transparência total' },
                  { title: 'Privacidade', desc: 'Tratada com seriedade' },
                  { title: 'Estabilidade', desc: 'Experiência rápida' },
                ].map((item) => (
                  <div key={item.title} className="p-6 rounded-xl bg-background border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-income/10 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-5 h-5 text-income" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-28 scroll-mt-20">
          <div className="container">
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="px-4 py-1.5">FAQ</Badge>
                <h2 className="text-3xl md:text-4xl font-bold">Perguntas frequentes</h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {[
                  { q: 'O plano Free precisa de cartão?', a: 'Não.' },
                  { q: 'Posso cancelar o Pro quando quiser?', a: 'Sim.' },
                  { q: 'Funciona no celular e no computador?', a: 'Sim.' },
                  { q: 'Posso importar dados?', a: 'Sim, no Pro.' },
                  { q: 'O que muda do Free para o Pro?', a: 'O Pro destrava histórico, dívidas, investimentos, importação e sincronização.' },
                  { q: 'Como começo?', a: 'Crie sua conta grátis e faça seu primeiro lançamento.' },
                ].map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-muted/50 rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline py-4">{item.q}</AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-income/10" />
          <div className="absolute top-10 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-20 w-72 h-72 bg-income/20 rounded-full blur-3xl" />
          
          <div className="container relative">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Chega de <span className="text-primary">planilha</span>.
              </h2>
              <p className="text-xl text-muted-foreground">
                Crie sua conta e veja seu mês na hora.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25" asChild>
                  <Link to="/cadastro">
                    Criar conta grátis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" onClick={() => scrollToSection('#planos')}>
                  Ver planos
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 bg-muted/30">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <FinanceLogo size={24} />
                <span className="font-bold">inanceX</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Termos de uso
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
