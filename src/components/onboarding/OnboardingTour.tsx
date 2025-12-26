import { useState, useEffect, useCallback, useRef } from 'react';
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
  targetSelector?: string;
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
    targetSelector: '[data-tour="dashboard"]',
  },
  {
    id: 'transactions',
    title: 'Lançamentos',
    description: 'Registre e categorize suas transações para entender seus gastos.',
    icon: <Receipt className="w-6 h-6" />,
    targetSelector: '[data-tour="transactions"]',
  },
  {
    id: 'investments',
    title: 'Investimentos',
    description: 'Monitore sua carteira por categoria: ações, renda fixa, cripto e mais.',
    icon: <TrendingUp className="w-6 h-6" />,
    targetSelector: '[data-tour="investments"]',
  },
  {
    id: 'debts',
    title: 'Dívidas',
    description: 'Controle financiamentos e parcelamentos. Acompanhe o progresso de cada pagamento.',
    icon: <CreditCard className="w-6 h-6" />,
    targetSelector: '[data-tour="debts"]',
  },
  {
    id: 'complete',
    title: 'Tudo pronto',
    description: 'Comece adicionando sua primeira transação.',
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [spotlightPosition, setSpotlightPosition] = useState<SpotlightPosition | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  // Update spotlight position when step changes
  useEffect(() => {
    if (step.targetSelector) {
      const targetElement = document.querySelector(step.targetSelector);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const padding = 8;
        setSpotlightPosition({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setSpotlightPosition(null);
      }
    } else {
      setSpotlightPosition(null);
    }
  }, [currentStep, step.targetSelector]);

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
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" onClick={onSkip}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightPosition && (
              <rect
                x={spotlightPosition.left}
                y={spotlightPosition.top}
                width={spotlightPosition.width}
                height={spotlightPosition.height}
                rx="12"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="hsl(var(--background))"
          fillOpacity="0.92"
          mask="url(#spotlight-mask)"
          className="backdrop-blur-sm"
        />
      </svg>

      {/* Spotlight border glow */}
      {spotlightPosition && (
        <div
          className="absolute rounded-xl border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)] pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: spotlightPosition.top,
            left: spotlightPosition.left,
            width: spotlightPosition.width,
            height: spotlightPosition.height,
          }}
        />
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className={cn(
          'absolute w-full max-w-md mx-4 transition-all duration-300 ease-out',
          isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
          spotlightPosition ? 'left-1/2 -translate-x-1/2 bottom-8' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        )}
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl">
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
