import { useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { 
  LandingHeader, 
  LandingFooter, 
  HeroSection, 
  TestimonialsSection,
  PricingSection,
  FAQSection
} from '@/components/landing';
import { 
  Check, 
  X, 
  ArrowRight, 
  Wallet,
  PieChart,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';

// Problem Section Component
const ProblemSection = memo(function ProblemSection() {
  return (
    <section className="pt-16 pb-10 lg:pt-28 lg:pb-16 bg-[#f8f9fb] text-landing-dark relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <ScrollReveal direction="up" duration={700}>
              <div className="flex items-center gap-3 mb-4 lg:mb-5">
                <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
                <span className="text-[11px] lg:text-xs font-semibold tracking-[0.2em] uppercase text-landing-cyan/80">O problema</span>
              </div>
              
              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] mb-8 lg:mb-10 leading-tight text-landing-dark/95"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Isso já aconteceu com você?
              </h2>
              
              <div className="space-y-4 lg:space-y-5 text-base lg:text-lg text-landing-dark/55 max-w-2xl">
                <p className="leading-[1.7]">
                  Chega no fim do mês e você não entende.
                  <br />
                  Trabalhou, recebeu, não fez nenhuma loucura…
                  <br />
                  <span className="text-landing-dark/90 font-medium">mas o dinheiro sumiu.</span>
                </p>
                <p className="leading-[1.7]">
                  Você até tentou planilha. Funcionou por uma semana.
                  <br />
                  Depois virou mais um arquivo esquecido.
                </p>
                <p className="leading-[1.7]">
                  Ou baixou um app cheio de função, conectou banco, configurou tudo…
                  <br />
                  <span className="text-landing-dark/90 font-medium">e desistiu porque era coisa demais.</span>
                </p>
              </div>

              <div className="mt-10 lg:mt-12 pl-5 lg:pl-6 border-l-[3px] border-landing-cyan/60">
                <p 
                  className="text-lg lg:text-xl xl:text-2xl text-landing-dark/85 leading-snug"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  <span className="italic font-semibold">O problema não é você.</span>
                  <br />
                  É que tentaram complicar algo que deveria ser simples.
                </p>
              </div>
              <p 
                className="mt-4 pl-5 lg:pl-6 text-sm lg:text-base text-landing-dark/70"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Controle financeiro não precisa virar um segundo emprego.
              </p>
            </ScrollReveal>
          </div>
          <div className="hidden lg:block lg:col-span-4" />
        </div>
      </div>
    </section>
  );
});

// How It Works Section Component
const HowItWorksSection = memo(function HowItWorksSection() {
  return (
    <section className="pt-16 pb-12 lg:pt-28 lg:pb-16 bg-landing-dark relative overflow-hidden">
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
            Como funciona (sem complicação)
          </h2>
        </ScrollReveal>
        
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
          <ScrollReveal direction="up" delay={0} duration={700} className="lg:col-span-7">
            <article className="group h-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.06] rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-landing-cyan/20 hover:bg-white/[0.07] transition-all duration-500">
              <div className="flex items-start justify-between mb-6 lg:mb-8">
                <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-landing-cyan/15 to-landing-teal/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <Wallet className="h-6 w-6 lg:h-7 lg:w-7 text-landing-cyan" />
                </div>
                <span className="text-5xl lg:text-6xl font-bold text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500">01</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white/90 mb-3 lg:mb-4">Você registra o que gastou</h3>
              <p className="text-white/45 text-base lg:text-lg leading-relaxed">
                Gastou R$45 no mercado? Abriu, digitou, pronto.
                <br />
                <span className="font-semibold text-white/70">Leva menos de 10 segundos.</span>
              </p>
            </article>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100} duration={700} className="lg:col-span-5">
            <article className="group h-full bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.06] rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-landing-teal/20 hover:bg-white/[0.06] transition-all duration-500">
              <div className="flex items-start justify-between mb-6 lg:mb-8">
                <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-landing-teal/15 to-landing-green/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <PieChart className="h-6 w-6 lg:h-7 lg:w-7 text-landing-teal" />
                </div>
                <span className="text-5xl lg:text-6xl font-bold text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500">02</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white/90 mb-3 lg:mb-4">O FinanceX organiza sozinho</h3>
              <p className="text-white/45 text-base lg:text-lg leading-relaxed">
                Tudo separado em categorias prontas.
                <br />
                <span className="font-semibold text-white/70">Você não configura nada.</span>
              </p>
            </article>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150} duration={700} className="lg:col-span-12">
            <article className="group bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-landing-green/20 transition-all duration-500">
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                <div>
                  <div className="flex items-start justify-between mb-6 lg:mb-8">
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-landing-green/15 to-landing-cyan/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <BarChart3 className="h-6 w-6 lg:h-7 lg:w-7 text-landing-green" />
                    </div>
                    <span className="text-5xl lg:text-6xl font-bold text-white/[0.06] group-hover:text-white/[0.1] transition-colors duration-500">03</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-white/90 mb-3 lg:mb-4">Você vê exatamente o que acontece</h3>
                  <p className="text-white/45 text-base lg:text-lg leading-relaxed">
                    Quanto entrou, quanto saiu e quanto sobrou.
                    <br />
                    Claro, direto, sem gráfico inútil.
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
            </article>
          </ScrollReveal>
        </div>
        
        <ScrollReveal direction="up" delay={200} duration={700}>
          <p className="text-center text-sm lg:text-base text-white/50 mt-10 lg:mt-14">
            Em poucos dias, você para de se perguntar onde o dinheiro foi.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
});

// For Who Section Component
const ForWhoSection = memo(function ForWhoSection() {
  const forYou = [
    'Você ganha dinheiro, mas não sabe pra onde ele vai',
    'Você quer algo simples, que funcione de verdade',
    'Você já desistiu de planilha e ferramenta complicada',
    'Você quer clareza, não controle obsessivo'
  ];

  const notForYou = [
    'Você quer tudo automático, conectado ao banco',
    'Você precisa de relatórios complexos pra empresa',
    'Você quer uma ferramenta gratuita que faça tudo',
    'Você já tem um sistema que resolve seu problema'
  ];

  return (
    <section className="pt-14 pb-6 lg:pt-24 lg:pb-10 bg-[#f8f9fb] text-landing-dark relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-8">
        <ScrollReveal direction="up" duration={700}>
          <header className="text-center mb-10 lg:mb-14">
            <div className="flex items-center justify-center gap-3 mb-4 lg:mb-5">
              <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
              <span className="text-[11px] lg:text-xs font-semibold tracking-[0.2em] uppercase text-landing-cyan/80">Clareza</span>
              <div className="h-px w-6 lg:w-8 bg-landing-cyan" />
            </div>
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-[-0.02em] text-landing-dark/95"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Pra quem o FinanceX faz sentido<br />(e pra quem não faz)
            </h2>
          </header>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
          <ScrollReveal direction="up" delay={0} duration={700}>
            <article className="bg-white border border-black/[0.04] rounded-2xl lg:rounded-3xl p-6 lg:p-8 h-full shadow-sm hover:shadow-xl hover:shadow-landing-green/[0.03] hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-landing-green/10 flex items-center justify-center">
                  <Check className="w-5 h-5 lg:w-6 lg:h-6 text-landing-green" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-landing-dark/90">É pra você se:</h3>
              </div>
              <ul className="space-y-4 lg:space-y-5">
                {forYou.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 lg:gap-4 group">
                    <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-landing-green/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-landing-green/15 transition-colors duration-300">
                      <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-landing-green" />
                    </div>
                    <span className="text-landing-dark/55 text-sm lg:text-base leading-relaxed whitespace-nowrap">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={80} duration={700}>
            <article className="bg-white border border-black/[0.04] rounded-2xl lg:rounded-3xl p-6 lg:p-8 h-full shadow-sm hover:shadow-xl hover:shadow-red-500/[0.03] hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-red-50 flex items-center justify-center">
                  <X className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-landing-dark/90">Não é pra você se:</h3>
              </div>
              <ul className="space-y-4 lg:space-y-5">
                {notForYou.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 lg:gap-4 group">
                    <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-100/60 transition-colors duration-300">
                      <X className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-red-400" />
                    </div>
                    <span className="text-landing-dark/55 text-sm lg:text-base leading-relaxed whitespace-nowrap">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </ScrollReveal>
        </div>

        <ScrollReveal direction="up" delay={150} duration={700}>
          <p className="text-center text-landing-dark/50 text-sm lg:text-base mt-8 lg:mt-10 max-w-md mx-auto leading-relaxed">
            O FinanceX foi feito pra quem quer clareza.<br />
            Não pra quem quer controle excessivo.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
});

// Final CTA Section Component
const FinalCTASection = memo(function FinalCTASection() {
  return (
    <section className="pt-16 pb-14 lg:pt-24 lg:pb-20 bg-landing-dark relative overflow-hidden">
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
              <span className="block">Menos ansiedade.</span>
              <span className="bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green bg-clip-text text-transparent">
                Mais clareza sobre seu dinheiro.
              </span>
            </h2>
            <p className="text-base lg:text-lg text-white/50 mb-8 lg:mb-10 max-w-md mx-auto">
              Em poucos dias, você para de se perguntar onde o dinheiro foi.
            </p>
            <Button 
              size="lg" 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-12 lg:h-14 px-8 lg:px-10 text-sm lg:text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:shadow-[0_0_48px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border-0"
            >
              Descobrir quanto sobra agora
              <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <p className="text-center text-white/40 text-xs lg:text-sm mt-4 leading-relaxed">
              Teste grátis por 3 dias • Depois, R$14,90/mês<br />
              Cancele quando quiser, em 1 clique.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
});

// Main Landing Page Component
export default function Landing() {
  useEffect(() => {
    document.title = 'FinanceX - Veja pra onde seu dinheiro vai';
  }, []);

  return (
    <div className="min-h-screen bg-landing-dark text-white overflow-x-hidden">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <ForWhoSection />
        <PricingSection />
        <FAQSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
