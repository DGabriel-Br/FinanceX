import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const features = [
  { title: 'Uso sem limites', description: 'Lançamentos ilimitados, sem travas.' },
  { title: 'Controle completo', description: 'Dívidas e investimentos no mesmo lugar.' },
  { title: 'Funciona na vida real', description: 'Offline no celular, mesmo sem internet.' },
  { title: 'Sempre sincronizado', description: 'Dados atualizados em todos os dispositivos.' }
];

export const PricingSection = memo(function PricingSection() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error('Checkout error:', error);
        toast.error('Erro ao iniciar checkout. Tente novamente.');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error('Erro ao obter link de checkout.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 lg:py-28 bg-landing-dark relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(34,211,238,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(15,23,42,0.4)_100%)]" />
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-8 relative">
        <ScrollReveal direction="up" duration={700}>
          <header className="text-center mb-10 lg:mb-14">
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
          </header>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100} duration={700}>
          <article className="max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-landing-cyan via-landing-teal to-landing-green rounded-[2rem] opacity-15 blur-2xl group-hover:opacity-25 transition-opacity duration-700" />
              
              <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] rounded-2xl lg:rounded-3xl p-6 lg:p-8">
                <div className="absolute -top-3 lg:-top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark text-xs lg:text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                    Plano único
                  </span>
                </div>

                <div className="text-center pt-4 lg:pt-5 mb-2">
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span 
                      className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white/95"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      R$ 14,90
                    </span>
                    <span className="text-white/40 text-base lg:text-lg">/mês</span>
                  </div>
                  <p className="text-white/40 text-sm lg:text-base mb-6 lg:mb-8">
                    Menos de R$ 0,50 por dia pra saber exatamente onde seu dinheiro vai.
                  </p>
                  <p className="text-white/50 text-sm lg:text-base border-t border-white/[0.06] pt-6">
                    Tudo incluso para controlar seu dinheiro com clareza
                  </p>
                </div>

                <ul className="space-y-4 mb-8 lg:mb-10">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 lg:gap-4">
                      <Check className="w-5 h-5 text-landing-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <span className="text-white/90 font-semibold text-sm lg:text-base block">{feature.title}</span>
                        <span className="text-white/50 text-sm">{feature.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full h-12 lg:h-14 text-sm lg:text-base rounded-full bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border-0" 
                  size="lg" 
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Iniciar teste
                      <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                    </>
                  )}
                </Button>
                <p className="text-center text-white/40 text-xs lg:text-sm mt-4">
                  Ao iniciar o teste, você concorda com a cobrança automática de R$14,90/mês após 3 dias. Você pode cancelar quando quiser, em 1 clique.
                </p>
              </div>
            </div>
          </article>
        </ScrollReveal>
      </div>
    </section>
  );
});
