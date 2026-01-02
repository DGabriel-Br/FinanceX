import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingCelebrationProps {
  projectedBalance: number;
  daysUntilNegative: number | null;
  isPositive: boolean;
  onAddAnother: () => void;
  onFinish: () => void;
}

export const OnboardingCelebration = ({
  projectedBalance,
  daysUntilNegative,
  isPositive,
  onAddAnother,
  onFinish,
}: OnboardingCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => setShowConfetti(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center relative overflow-hidden">
      {/* Confetti effect - CSS only */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute w-2 h-2 rounded-full animate-confetti',
                i % 4 === 0 && 'bg-primary',
                i % 4 === 1 && 'bg-income',
                i % 4 === 2 && 'bg-yellow-400',
                i % 4 === 3 && 'bg-blue-400'
              )}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Success icon */}
      <div className={cn(
        'mb-6 p-4 rounded-2xl transition-transform duration-500 animate-fade-in opacity-0',
        showConfetti && 'scale-110',
        isPositive ? 'bg-income/10' : 'bg-expense/10'
      )} style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        {isPositive ? (
          <CheckCircle2 className="w-12 h-12 text-income" />
        ) : (
          <TrendingDown className="w-12 h-12 text-expense" />
        )}
      </div>

      {/* Main message */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        Pronto. Isso já muda tudo.
      </h1>

      {/* Projection result */}
      <div className={cn(
        'w-full max-w-xs p-6 rounded-2xl mb-6 animate-fade-in opacity-0',
        isPositive ? 'bg-income/10' : 'bg-expense/10'
      )} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        {isPositive ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-income" />
              <span className="text-sm text-muted-foreground">No ritmo atual</span>
            </div>
            <p className="text-lg font-medium text-foreground mb-1">
              Sobram
            </p>
            <p className="text-3xl font-bold text-income">
              {formatCurrency(projectedBalance)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              este mês
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-expense" />
              <span className="text-sm text-muted-foreground">No ritmo atual</span>
            </div>
            <p className="text-lg font-medium text-foreground mb-1">
              Você entra no vermelho em
            </p>
            <p className="text-3xl font-bold text-expense">
              {daysUntilNegative ?? 0} {(daysUntilNegative ?? 0) === 1 ? 'dia' : 'dias'}
            </p>
          </>
        )}
      </div>

      {/* Reinforcement message */}
      <p className="text-muted-foreground text-sm mb-10 max-w-xs leading-relaxed animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
        Agora, sempre que lançar um gasto, você sabe{' '}
        <span className="text-foreground font-medium">
          se pode gastar ou se é melhor parar
        </span>
        .
      </p>

      {/* CTAs */}
      <div className="w-full max-w-xs space-y-3 animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
        <Button 
          onClick={onAddAnother} 
          variant="outline"
          size="lg" 
          className="w-full h-12 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar outro gasto
        </Button>

        <button 
          onClick={onFinish}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Ou explore o FinanceX no seu ritmo
        </button>
      </div>
    </div>
  );
};
