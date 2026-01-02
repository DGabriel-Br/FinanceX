import { useState, useCallback, useRef } from 'react';
import { OnboardingImpactScreen } from './OnboardingImpactScreen';
import { OnboardingIncomeScreen } from './OnboardingIncomeScreen';
import { OnboardingExpenseScreen } from './OnboardingExpenseScreen';
import { OnboardingCelebration } from './OnboardingCelebration';
import { calculateSimpleProjection } from '@/core/finance/projections';
import { ExpenseCategory, Transaction } from '@/types/transaction';
import { cn } from '@/lib/utils';
import { track } from '@/infra/analytics';

const getIncomeRange = (value: number): string => {
  if (value <= 1000) return '0-1000';
  if (value <= 3000) return '1001-3000';
  if (value <= 5000) return '3001-5000';
  if (value <= 10000) return '5001-10000';
  return '10000+';
};

const getBalanceRange = (value: number): string => {
  if (value < 0) return 'negative';
  if (value <= 500) return '0-500';
  if (value <= 2000) return '501-2000';
  if (value <= 5000) return '2001-5000';
  return '5000+';
};

type OnboardingStep = 'impact' | 'income' | 'expense' | 'celebration';

interface OnboardingOverlayProps {
  onComplete: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
}

export const OnboardingOverlay = ({ 
  onComplete, 
  onAddTransaction 
}: OnboardingOverlayProps) => {
  const [step, setStep] = useState<OnboardingStep>('impact');
  const [isAnimating, setIsAnimating] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [lastExpenseValue, setLastExpenseValue] = useState(0);
  const [projection, setProjection] = useState<{
    projectedBalance: number;
    daysUntilNegative: number | null;
    isPositive: boolean;
  } | null>(null);
  const hasTrackedFirstExpense = useRef(false);


  const animateToStep = useCallback((nextStep: OnboardingStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsAnimating(false);
    }, 200);
  }, []);

  const handleStart = () => {
    track('onboarding_started');
    animateToStep('income');
  };

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleIncomeContinue = async (income: number) => {
    setMonthlyIncome(income);
    
    // Salvar receita como transação
    const today = getLocalDateString();
    await onAddTransaction({
      type: 'receita',
      category: 'salario',
      value: income,
      date: today,
      description: 'Renda mensal',
    });

    track('onboarding_income_added', { income_range: getIncomeRange(income) });
    animateToStep('expense');
  };

  const handleExpenseSave = async (expense: { value: number; category: ExpenseCategory; description: string }) => {
    const isFirstExpense = !hasTrackedFirstExpense.current;
    setLastExpenseValue(expense.value);
    
    // Salvar despesa como transação
    const today = getLocalDateString();
    await onAddTransaction({
      type: 'despesa',
      category: expense.category,
      value: expense.value,
      date: today,
      description: expense.description,
    });

    // Track expense event
    if (isFirstExpense) {
      track('onboarding_expense_added', { 
        category: expense.category, 
        has_description: !!expense.description && expense.description !== 'Gasto registrado no onboarding'
      });
      hasTrackedFirstExpense.current = true;
    } else {
      track('onboarding_second_expense_added', { category: expense.category });
    }

    // Calcular projeção
    const proj = calculateSimpleProjection(monthlyIncome, expense.value);
    setProjection({
      projectedBalance: proj.projectedBalance,
      daysUntilNegative: proj.daysUntilNegative,
      isPositive: proj.isPositive,
    });

    // Track completion (chegou no "quanto sobra")
    track('onboarding_completed', { 
      is_positive: proj.isPositive, 
      projected_balance_range: getBalanceRange(proj.projectedBalance)
    });

    animateToStep('celebration');
  };

  const handleAddAnother = () => {
    // Voltar para tela de despesa para adicionar outro gasto
    animateToStep('expense');
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background">
      <div 
        className={cn(
          'h-full w-full transition-all duration-200',
          isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
        )}
      >
        {step === 'impact' && (
          <OnboardingImpactScreen onStart={handleStart} />
        )}

        {step === 'income' && (
          <OnboardingIncomeScreen 
            onContinue={handleIncomeContinue} 
            onBack={() => animateToStep('impact')}
          />
        )}

        {step === 'expense' && (
          <OnboardingExpenseScreen 
            onSave={handleExpenseSave}
            onBack={() => animateToStep('income')}
          />
        )}

        {step === 'celebration' && projection && (
          <OnboardingCelebration
            projectedBalance={projection.projectedBalance}
            daysUntilNegative={projection.daysUntilNegative}
            isPositive={projection.isPositive}
            onAddAnother={handleAddAnother}
            onFinish={handleFinish}
            onBack={() => animateToStep('expense')}
          />
        )}
      </div>
    </div>
  );
};
