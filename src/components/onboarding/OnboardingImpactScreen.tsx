import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface OnboardingImpactScreenProps {
  onStart: () => void;
}

export const OnboardingImpactScreen = ({ onStart }: OnboardingImpactScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 mb-4 animate-fade-in opacity-0" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}>
        Em 3 passos rápidos
      </span>
      {/* Icon */}
      <div className="mb-8 p-4 rounded-2xl bg-primary/10 animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <Sparkles className="w-12 h-12 text-primary" />
      </div>

      {/* Headline */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 max-w-sm animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        Antes de tudo, vamos descobrir quanto sobra pra você.
      </h1>

      {/* Sub */}
      <p className="text-muted-foreground text-lg mb-12 max-w-xs animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        Leva menos de 1 minuto. Sem compromisso.
      </p>

      {/* CTA único */}
      <Button 
        onClick={onStart} 
        size="lg" 
        className="w-full max-w-xs h-14 text-lg font-semibold animate-fade-in opacity-0 hover:scale-105 transition-transform"
        style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
      >
        Descobrir agora
      </Button>
    </div>
  );
};
