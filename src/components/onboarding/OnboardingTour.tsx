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
  Eye,
  EyeOff,
  Moon,
  Sun,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  position: 'center' | 'left' | 'right' | 'bottom';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao FinanceX! 🎉',
    description: 'Sua plataforma completa para controle financeiro pessoal. Vamos fazer um tour rápido pelos recursos principais.',
    icon: <Sparkles className="w-8 h-8" />,
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Aqui você tem uma visão geral das suas finanças: receitas, despesas, saldo e gráficos de evolução.',
    icon: <LayoutDashboard className="w-8 h-8" />,
    highlight: 'dashboard',
    position: 'left',
  },
  {
    id: 'transactions',
    title: 'Lançamentos',
    description: 'Registre todas as suas receitas e despesas. Categorize e acompanhe cada movimentação do seu dinheiro.',
    icon: <Receipt className="w-8 h-8" />,
    highlight: 'lancamentos',
    position: 'left',
  },
  {
    id: 'debts',
    title: 'Dívidas',
    description: 'Controle seus financiamentos e parcelamentos. Acompanhe o progresso de pagamento de cada dívida.',
    icon: <CreditCard className="w-8 h-8" />,
    highlight: 'dividas',
    position: 'left',
  },
  {
    id: 'investments',
    title: 'Investimentos',
    description: 'Monitore seus investimentos por categoria: ações, renda fixa, criptomoedas e muito mais.',
    icon: <TrendingUp className="w-8 h-8" />,
    highlight: 'investimentos',
    position: 'left',
  },
  {
    id: 'visibility',
    title: 'Ocultar Valores',
    description: 'Use o botão de visibilidade para esconder seus valores quando outras pessoas estiverem por perto.',
    icon: <><Eye className="w-4 h-4" /><EyeOff className="w-4 h-4" /></>,
    position: 'right',
  },
  {
    id: 'theme',
    title: 'Tema Claro/Escuro',
    description: 'Alterne entre o tema claro e escuro de acordo com sua preferência.',
    icon: <><Sun className="w-4 h-4" /><Moon className="w-4 h-4" /></>,
    position: 'left',
  },
  {
    id: 'complete',
    title: 'Tudo Pronto!',
    description: 'Você está pronto para começar! Adicione sua primeira transação e comece a controlar suas finanças.',
    icon: <CheckCircle2 className="w-8 h-8" />,
    position: 'center',
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
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        goToPrevStep();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextStep, goToPrevStep, onSkip]);

  const getPositionClasses = () => {
    switch (step.position) {
      case 'left':
        return 'left-72 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-8 top-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-24 left-1/2 -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay escuro */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onSkip}
      />

      {/* Highlight na sidebar para etapas específicas */}
      {step.highlight && (
        <div 
          className="absolute left-0 top-0 w-64 h-full pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 0%, transparent 100%)',
          }}
        />
      )}

      {/* Card do tour */}
      <div
        className={cn(
          'absolute z-10 w-[400px] max-w-[90vw] transition-all duration-300',
          getPositionClasses(),
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        )}
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header com progresso */}
          <div className="relative h-1 bg-muted">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-income transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {/* Botão fechar */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Pular tour"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ícone */}
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-income/20 text-primary">
                {step.icon}
              </div>
            </div>

            {/* Título e descrição */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Indicadores de etapas */}
            <div className="flex justify-center gap-1.5 mb-6">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentStep(index);
                      setIsAnimating(false);
                    }, 150);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    index === currentStep 
                      ? 'w-6 bg-primary' 
                      : index < currentStep 
                        ? 'bg-primary/50' 
                        : 'bg-muted-foreground/30'
                  )}
                  aria-label={`Ir para etapa ${index + 1}`}
                />
              ))}
            </div>

            {/* Botões de navegação */}
            <div className="flex gap-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={goToPrevStep}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              <Button
                onClick={goToNextStep}
                className={cn(
                  'flex-1 bg-gradient-to-r from-primary to-income hover:opacity-90',
                  isFirstStep && 'w-full'
                )}
              >
                {isLastStep ? (
                  <>
                    Começar
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Dica de atalho */}
            <p className="text-center text-xs text-muted-foreground/50 mt-4">
              Use as setas ← → ou Enter para navegar • Esc para pular
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
