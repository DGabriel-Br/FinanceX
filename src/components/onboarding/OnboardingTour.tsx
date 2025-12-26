import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Moon,
  Sparkles,
  CheckCircle2,
  Rocket,
  Target,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  tip?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao FinanceX!',
    description: 'Sua jornada para o controle financeiro começa agora. Vamos conhecer os principais recursos da plataforma.',
    icon: <Rocket className="w-10 h-10" />,
    gradient: 'from-violet-500 to-purple-600',
    tip: 'Leva apenas 1 minuto!',
  },
  {
    id: 'dashboard',
    title: 'Visão Geral',
    description: 'No Dashboard você acompanha receitas, despesas e saldo em tempo real. Gráficos mostram a evolução das suas finanças.',
    icon: <LayoutDashboard className="w-10 h-10" />,
    gradient: 'from-blue-500 to-cyan-500',
    tip: 'Acesse pelo menu lateral',
  },
  {
    id: 'transactions',
    title: 'Lançamentos',
    description: 'Registre cada entrada e saída. Categorize suas transações para entender para onde vai seu dinheiro.',
    icon: <Receipt className="w-10 h-10" />,
    gradient: 'from-emerald-500 to-green-500',
    tip: 'Clique em + para adicionar',
  },
  {
    id: 'debts',
    title: 'Controle de Dívidas',
    description: 'Acompanhe financiamentos, empréstimos e parcelamentos. Visualize o progresso de pagamento de cada dívida.',
    icon: <CreditCard className="w-10 h-10" />,
    gradient: 'from-orange-500 to-amber-500',
    tip: 'Nunca perca um vencimento',
  },
  {
    id: 'investments',
    title: 'Investimentos',
    description: 'Monitore sua carteira de investimentos por categoria: ações, renda fixa, fundos, cripto e mais.',
    icon: <TrendingUp className="w-10 h-10" />,
    gradient: 'from-pink-500 to-rose-500',
    tip: 'Defina metas de aporte',
  },
  {
    id: 'features',
    title: 'Recursos Especiais',
    description: 'Oculte valores com um clique, alterne entre tema claro/escuro, e filtre por período personalizado.',
    icon: <Zap className="w-10 h-10" />,
    gradient: 'from-indigo-500 to-violet-500',
    tip: 'Sua privacidade importa',
  },
  {
    id: 'security',
    title: 'Seus Dados Seguros',
    description: 'Todas as informações são criptografadas e armazenadas com segurança. Apenas você tem acesso.',
    icon: <Shield className="w-10 h-10" />,
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    id: 'complete',
    title: 'Pronto para Começar!',
    description: 'Sua primeira missão: adicionar uma transação. Quanto mais dados, melhores insights você terá.',
    icon: <Target className="w-10 h-10" />,
    gradient: 'from-primary to-income',
  },
];

// Confetti particle component
const Confetti = ({ isActive }: { isActive: boolean }) => {
  const particles = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 6,
      color: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 6)],
    }))
  , []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[101] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-[confetti_3s_ease-out_forwards]"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleComplete = useCallback(() => {
    setShowConfetti(true);
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  }, [onComplete]);

  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      handleComplete();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsAnimating(false);
    }, 200);
  }, [isLastStep, handleComplete]);

  const goToPrevStep = useCallback(() => {
    if (isFirstStep) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setIsAnimating(false);
    }, 200);
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

  return (
    <>
      <Confetti isActive={showConfetti} />
      
      <div 
        className={cn(
          "fixed inset-0 z-[100] transition-opacity duration-500",
          isExiting ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Main card */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className={cn(
              'relative w-full max-w-lg transition-all duration-300 ease-out',
              isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
            )}
          >
            {/* Glow effect behind card */}
            <div 
              className={cn(
                "absolute -inset-1 rounded-3xl opacity-50 blur-xl transition-all duration-500",
                `bg-gradient-to-r ${step.gradient}`
              )}
            />
            
            <div className="relative bg-card/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Progress bar */}
              <div className="relative h-1.5 bg-muted/50">
                <div 
                  className={cn(
                    "absolute left-0 top-0 h-full transition-all duration-700 ease-out rounded-r-full",
                    `bg-gradient-to-r ${step.gradient}`
                  )}
                  style={{ width: `${progress}%` }}
                />
                {/* Shimmer effect */}
                <div 
                  className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"
                  style={{ left: `${progress - 10}%` }}
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Close button */}
                <button
                  onClick={onSkip}
                  className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-all duration-200 group"
                  aria-label="Pular tour"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                </button>

                {/* Step counter */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className={cn(
                    "text-xs font-medium px-3 py-1 rounded-full",
                    `bg-gradient-to-r ${step.gradient} text-white`
                  )}>
                    {currentStep + 1} de {tourSteps.length}
                  </span>
                  {step.tip && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      💡 {step.tip}
                    </span>
                  )}
                </div>

                {/* Icon with animated background */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Pulsing rings */}
                    <div className={cn(
                      "absolute inset-0 rounded-3xl animate-ping opacity-20",
                      `bg-gradient-to-r ${step.gradient}`
                    )} style={{ animationDuration: '2s' }} />
                    <div className={cn(
                      "absolute -inset-2 rounded-3xl animate-pulse opacity-30",
                      `bg-gradient-to-r ${step.gradient}`
                    )} />
                    
                    {/* Icon container */}
                    <div className={cn(
                      "relative p-5 rounded-3xl text-white shadow-lg",
                      `bg-gradient-to-br ${step.gradient}`
                    )}>
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Title and description */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mb-8">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (index === currentStep) return;
                        setIsAnimating(true);
                        setTimeout(() => {
                          setCurrentStep(index);
                          setIsAnimating(false);
                        }, 200);
                      }}
                      className={cn(
                        'h-2 rounded-full transition-all duration-500 ease-out',
                        index === currentStep 
                          ? `w-8 bg-gradient-to-r ${step.gradient}` 
                          : index < currentStep 
                            ? 'w-2 bg-primary/60 hover:bg-primary/80' 
                            : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                      )}
                      aria-label={`Ir para etapa ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      onClick={goToPrevStep}
                      className="flex-1 h-12 border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>
                  )}
                  
                  <Button
                    onClick={goToNextStep}
                    className={cn(
                      'flex-1 h-12 text-white font-medium shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                      `bg-gradient-to-r ${step.gradient} hover:opacity-90`,
                      isFirstStep && 'w-full'
                    )}
                  >
                    {isLastStep ? (
                      <>
                        Começar Agora
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Keyboard hint */}
                <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground/40">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">←</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">→</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">Esc</kbd>
                    pular
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add confetti keyframe animation */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </>
  );
};
