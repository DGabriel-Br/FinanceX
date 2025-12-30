import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Check, X, ArrowRight, Shield, Smartphone, TrendingUp, Zap } from 'lucide-react';

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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5">
              <FinanceLogo size={26} />
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                inanceX
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/cadastro">Começar agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero - duas colunas no desktop */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Coluna esquerda - texto */}
              <ScrollReveal direction="up" duration={500}>
                <div className="max-w-xl">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight mb-6">
                    Se você não sabe pra onde seu dinheiro vai, esse app é pra você.
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    Você anota o que gasta. O app te mostra, de forma clara, se você pode gastar mais ou se precisa parar. Sem complicação.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" onClick={() => navigate('/cadastro')} className="h-12 px-8">
                      Começar a usar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => navigate('/login')} className="h-12 px-8">
                      Já tenho conta
                    </Button>
                  </div>
                </div>
              </ScrollReveal>

              {/* Coluna direita - card visual premium */}
              <ScrollReveal direction="up" delay={150} duration={500}>
                <div className="relative lg:pl-8">
                  <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-muted-foreground">Dezembro 2024</span>
                      <span className="text-xs bg-income/10 text-income px-2.5 py-1 rounded-full font-medium">
                        Saldo positivo
                      </span>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div>
                          <p className="text-sm text-muted-foreground">Entradas</p>
                          <p className="text-xl font-semibold text-income">R$ 5.200,00</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-income" />
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div>
                          <p className="text-sm text-muted-foreground">Saídas</p>
                          <p className="text-xl font-semibold text-expense">R$ 3.847,50</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-expense rotate-180" />
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Sobrou este mês</p>
                      <p className="text-2xl font-semibold">R$ 1.352,50</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Dor real - editorial */}
        <section className="py-20 lg:py-28 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={500}>
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
                  Você já passou por isso?
                </h2>
                <div className="space-y-6 text-muted-foreground">
                  <p className="text-lg leading-relaxed">
                    Chega no fim do mês e você não entende. Trabalhou, recebeu, não fez nenhuma loucura... mas o dinheiro sumiu.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Você já tentou planilha. Funcionou por uma semana. Depois virou aquele arquivo que você nem abre mais.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Ou baixou um app cheio de função, conectou com banco, configurou categorias... e desistiu porque era coisa demais.
                  </p>
                  <div className="pt-6 mt-6 border-l-2 border-primary pl-6">
                    <p className="text-foreground font-medium text-lg">
                      O problema não é você. É que essas soluções complicam algo que deveria ser simples.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Como funciona - cards numerados */}
        <section className="py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={500}>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-14">
                Como funciona
              </h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <ScrollReveal direction="up" delay={0} duration={500}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold mb-5">
                    1
                  </div>
                  <h3 className="text-lg font-medium mb-3">Você lança o que gastou</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Gastou R$ 45 no mercado? Abre o app, digita, pronto. Menos de 10 segundos.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100} duration={500}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold mb-5">
                    2
                  </div>
                  <h3 className="text-lg font-medium mb-3">O app organiza pra você</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Categorias prontas. Tudo separado automaticamente. Você não precisa montar nada.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200} duration={500}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold mb-5">
                    3
                  </div>
                  <h3 className="text-lg font-medium mb-3">Você vê o que está acontecendo</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Quanto entrou, quanto saiu, quanto sobrou. Claro, direto, sem gráfico complicado.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Para quem é / não é */}
        <section className="py-20 lg:py-28 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={500}>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-14">
                Pra quem é (e pra quem não é)
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="up" delay={0} duration={500}>
                <div className="bg-card border border-border rounded-xl p-6 sm:p-8 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-income/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-income" />
                    </div>
                    <h3 className="font-medium text-lg">É pra você se:</h3>
                  </div>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-income">•</span>
                      Você ganha dinheiro mas não sabe pra onde ele vai
                    </li>
                    <li className="flex gap-3">
                      <span className="text-income">•</span>
                      Você quer algo simples que funcione no celular
                    </li>
                    <li className="flex gap-3">
                      <span className="text-income">•</span>
                      Você já desistiu de planilha e de app complicado
                    </li>
                    <li className="flex gap-3">
                      <span className="text-income">•</span>
                      Você quer clareza, não controle obsessivo
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100} duration={500}>
                <div className="bg-card border border-border rounded-xl p-6 sm:p-8 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-expense/10 flex items-center justify-center">
                      <X className="w-4 h-4 text-expense" />
                    </div>
                    <h3 className="font-medium text-lg">Não é pra você se:</h3>
                  </div>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-expense">•</span>
                      Você quer conectar conta bancária automaticamente
                    </li>
                    <li className="flex gap-3">
                      <span className="text-expense">•</span>
                      Você precisa de relatórios complexos pra empresa
                    </li>
                    <li className="flex gap-3">
                      <span className="text-expense">•</span>
                      Você quer um app gratuito com tudo
                    </li>
                    <li className="flex gap-3">
                      <span className="text-expense">•</span>
                      Você já tem um sistema que funciona
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Preço - card premium */}
        <section className="py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="max-w-lg mx-auto">
              <ScrollReveal direction="up" duration={500}>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-14 text-center">
                  Quanto custa
                </h2>

                <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm">
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl sm:text-5xl font-semibold">R$ 14,90</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cancela quando quiser. Sem multa.
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Lançamentos ilimitados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Controle de dívidas e investimentos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Funciona offline no celular</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Sincroniza entre dispositivos</span>
                    </div>
                  </div>

                  <Button className="w-full h-12" size="lg" onClick={() => navigate('/planos')}>
                    Assinar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Segurança - discreto */}
        <section className="py-20 lg:py-28 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={500}>
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
                  Sobre segurança e privacidade
                </h2>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <p className="text-muted-foreground leading-relaxed">
                      Seus dados ficam criptografados. Ninguém além de você tem acesso.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Smartphone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <p className="text-muted-foreground leading-relaxed">
                      O app funciona offline. Você pode lançar gastos sem internet e sincroniza depois.
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground mt-8 pt-8 border-t border-border">
                  Não vendemos dados. Não mostramos anúncios. O negócio é simples: você paga, o app funciona.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <ScrollReveal direction="up" duration={500}>
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
                  Menos ansiedade, mais clareza.
                </h2>
                <p className="text-muted-foreground mb-8">
                  Comece hoje e veja pra onde seu dinheiro está indo.
                </p>
                <Button size="lg" onClick={() => navigate('/cadastro')} className="h-12 px-8">
                  Começar a usar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <FinanceLogo size={20} />
              <span className="font-semibold tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                inanceX
              </span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground transition-colors">Termos</Link>
              <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
              <a href="mailto:contato@financex.app" className="hover:text-foreground transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
