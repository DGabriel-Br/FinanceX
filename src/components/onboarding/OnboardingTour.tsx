import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Receipt, 
  CreditCard, 
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao FinanceX',
    description: 'Vamos fazer um tour rápido pelos recursos principais da plataforma.',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Acompanhe receitas, despesas e saldo. Visualize gráficos de evolução financeira.',
    icon: <LayoutDashboard className="w-6 h-6" />,
  },
  {
    id: 'transactions',
    title: 'Lançamentos',
    description: 'Registre e categorize suas transações para entender seus gastos.',
    icon: <Receipt className="w-6 h-6" />,
  },
  {
    id: 'debts',
    title: 'Dívidas',
    description: 'Controle financiamentos e parcelamentos. Acompanhe o progresso de cada pagamento.',
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    id: 'investments',
    title: 'Investimentos',
    description: 'Monitore sua carteira por categoria: ações, renda fixa, cripto e mais.',
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: 'complete',
    title: 'Tudo pronto',
    description: 'Comece adicionando sua primeira transação.',
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      onComplete();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsAnimating(false);
    }, 150);
  }, [isLastStep, onComplete]);

  const goToPrevStep = useCallback(() => {
    if (isFirstStep) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setIsAnimating(false);
    }, 150);
  }, [isFirstStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') goToNextStep();
      else if (e.key === 'ArrowLeft') goToPrevStep();
      else if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextStep, goToPrevStep, onSkip]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" onClick={onSkip} />

      {/* Card */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4 transition-all duration-200',
          isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        )}
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {tourSteps.length}
            </span>
            <button
              onClick={onSkip}
              className="p-1.5 -mr-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10 text-primary">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border">
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    index === currentStep 
                      ? 'w-6 bg-primary' 
                      : 'w-1.5 bg-muted-foreground/20'
                  )}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="ghost" onClick={goToPrevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}
              <Button onClick={goToNextStep} className={cn("flex-1", isFirstStep && "w-full")}>
                {isLastStep ? 'Começar' : 'Próximo'}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
