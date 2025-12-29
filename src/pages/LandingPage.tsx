import { Link } from 'react-router-dom';
import { Check, X, Zap, LayoutDashboard, TrendingUp, Play, Shield, Clock, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { PublicHeader } from '@/components/landing/PublicHeader';

const LandingPage = () => {
  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main>
        {/* HERO */}
        <section className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Chega de planilha.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                No FinanceX você lança e pronto. O app organiza e mostra seu mês na hora.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link to="/cadastro">Criar conta grátis</Link>
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection('#como-funciona')}>
                  Ver como funciona
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Sem cartão no Free.</p>
            </div>
            <div>
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <LayoutDashboard className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">Preview do Dashboard</span>
                  </div>
                </div>
                <CardContent className="py-3">
                  <p className="text-sm text-muted-foreground text-center">Dashboard do FinanceX</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* RECONHECIMENTO */}
        <section className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Você sabe como é.</h2>
            <ul className="space-y-4 text-left max-w-md mx-auto">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                Você começa animado.
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                Monta planilha, aba, categoria, gráfico.
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                Funciona por um tempo.
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                Depois vira trabalho.
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                E quando vira trabalho, você para.
              </li>
            </ul>
            <p className="text-xl md:text-2xl font-semibold text-foreground">
              O problema não é você. É a planilha.
            </p>
          </div>
        </section>

        <Separator />

        {/* DEMONSTRAÇÃO */}
        <section id="como-funciona" className="container py-16 md:py-24 scroll-mt-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Veja como funciona na prática</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Você lança, o FinanceX organiza e você enxerga. Sem ficar arrumando planilha.
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">Vídeo demonstrativo</span>
                </div>
              </div>
            </Card>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Lançamentos</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <LayoutDashboard className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Dashboard</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Dívidas e Investimentos</p>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground text-center">Uso real.</p>
          </div>
        </section>

        <Separator />

        {/* COMO FUNCIONA - 3 PASSOS */}
        <section className="container py-16 md:py-24">
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">1. Você anota em segundos</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <PieChart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">2. O app organiza sozinho</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">3. Você vê seu mês na hora</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </section>

        <Separator />

        {/* MECANISMO ÚNICO */}
        <section className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center">Tudo em um lugar só.</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Gastos, entradas e saldo do mês, sem bagunça.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Dívidas com progresso e previsão de término <Badge variant="secondary" className="ml-1">Pro</Badge></span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Metas e investimentos com acompanhamento <Badge variant="secondary" className="ml-1">Pro</Badge></span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Importar e exportar dados <Badge variant="secondary" className="ml-1">Pro</Badge></span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Backup e sincronização <Badge variant="secondary" className="ml-1">Pro</Badge></span>
              </li>
            </ul>
          </div>
        </section>

        <Separator />

        {/* PARA QUEM É / NÃO É */}
        <section className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-income/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-income">
                  <Check className="w-5 h-5" />
                  É para você se
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                    quer sair da planilha
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                    quer entender seus gastos sem complicar
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                    quer ver o mês de um jeito simples
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-expense/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-expense">
                  <X className="w-5 h-5" />
                  Não é para você se
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <X className="w-4 h-4 text-expense mt-0.5 shrink-0" />
                    gosta de mexer em fórmula
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <X className="w-4 h-4 text-expense mt-0.5 shrink-0" />
                    quer um monte de gráfico só por enfeite
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <X className="w-4 h-4 text-expense mt-0.5 shrink-0" />
                    prefere sistemas complicados
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* PLANOS */}
        <section id="planos" className="container py-16 md:py-24 scroll-mt-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center">Planos</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Para começar e ganhar clareza</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Lançamentos básicos
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Dashboard do mês
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Categorias
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Resumo simples
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/cadastro">Criar conta grátis</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="border-primary relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recomendado</Badge>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>Para controle total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Histórico ilimitado
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Dívidas com previsão
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Investimentos e metas
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Importar e exportar
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-income mt-0.5 shrink-0" />
                      Backup e sincronização
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/cadastro">Assinar Pro</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Assinatura no cartão. Cancele quando quiser.
            </p>
          </div>
        </section>

        <Separator />

        {/* CONFIANÇA E PRIVACIDADE */}
        <section className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Seus dados são seus.</h2>
            <ul className="space-y-4 text-left max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Sem truque.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Privacidade tratada com seriedade.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-income mt-0.5 shrink-0" />
                <span>Experiência rápida e estável.</span>
              </li>
            </ul>
          </div>
        </section>

        <Separator />

        {/* FAQ */}
        <section id="faq" className="container py-16 md:py-24 scroll-mt-20">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center">Perguntas frequentes</h2>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>O plano Free precisa de cartão?</AccordionTrigger>
                <AccordionContent>Não.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Posso cancelar o Pro quando quiser?</AccordionTrigger>
                <AccordionContent>Sim.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Funciona no celular e no computador?</AccordionTrigger>
                <AccordionContent>Sim.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Posso importar dados?</AccordionTrigger>
                <AccordionContent>Sim, no Pro.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>O que muda do Free para o Pro?</AccordionTrigger>
                <AccordionContent>
                  O Pro destrava histórico, dívidas, investimentos, importação e sincronização.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Como começo?</AccordionTrigger>
                <AccordionContent>
                  Crie sua conta grátis e faça seu primeiro lançamento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <Separator />

        {/* CTA FINAL */}
        <section className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Chega de planilha.</h2>
            <p className="text-lg text-muted-foreground">
              Crie sua conta e veja seu mês na hora.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/cadastro">Criar conta grátis</Link>
              </Button>
              <Button size="lg" variant="link" onClick={() => scrollToSection('#planos')}>
                Ver planos
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
                </span>
              </div>
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
