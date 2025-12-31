import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ArrowRight, TrendingUp, Check } from 'lucide-react';

export const HeroSection = memo(function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100svh] flex items-center pt-16 lg:pt-20 overflow-hidden">
      {/* Background layers for depth */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(45,212,191,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(15,23,42,0.4)_100%)]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative z-10 py-12 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          {/* Left content */}
          <div className="lg:col-span-7 lg:pr-8">
            <ScrollReveal direction="up" duration={800}>
              <h1 
                className="text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold leading-[1.08] tracking-[-0.02em] mb-6 lg:mb-8"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                <span className="text-white/95">Se você não sabe pra onde seu dinheiro vai,</span>
                <br />
                <span className="bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green bg-clip-text text-transparent">
                  o FinanceX mostra. Simples assim.
                </span>
              </h1>
              
              <p className="text-base lg:text-lg text-white/50 leading-relaxed mb-8 lg:mb-10 max-w-lg">
                Você anota o que gasta. O app mostra, com clareza, se você pode gastar mais ou se precisa parar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} 
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

          {/* Right - Dashboard preview */}
          <div className="lg:col-span-5 lg:-mr-8 xl:-mr-16">
            <ScrollReveal direction="up" delay={150} duration={800}>
              <div className="relative lg:translate-x-4 xl:translate-x-8">
                <div className="absolute -inset-8 bg-gradient-to-br from-landing-cyan/15 via-landing-teal/8 to-transparent rounded-[2.5rem] blur-3xl opacity-60" />
                
                <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl lg:rounded-3xl p-5 lg:p-7 shadow-2xl">
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

                  <div className="p-4 lg:p-5 rounded-xl bg-gradient-to-br from-landing-cyan/[0.08] to-landing-teal/[0.03] border border-landing-cyan/10">
                    <p className="text-xs text-white/40 mb-1.5 tracking-wide uppercase">Sobrou este mês</p>
                    <p className="text-2xl lg:text-3xl font-bold text-landing-green">
                      R$ 1.352,50
                    </p>
                  </div>
                </div>

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
  );
});
