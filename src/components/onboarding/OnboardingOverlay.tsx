import { useState, useCallback } from 'react';
import { OnboardingImpactScreen } from './OnboardingImpactScreen';
import { OnboardingIncomeScreen } from './OnboardingIncomeScreen';
import { OnboardingExpenseScreen } from './OnboardingExpenseScreen';
import { OnboardingCelebration } from './OnboardingCelebration';
import { calculateSimpleProjection } from '@/core/finance/projections';
import { ExpenseCategory, Transaction } from '@/types/transaction';
import { cn } from '@/lib/utils';

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

  const animateToStep = useCallback((nextStep: OnboardingStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsAnimating(false);
    }, 200);
  }, []);

  const handleStart = () => {
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

    animateToStep('expense');
  };

  const handleExpenseSave = async (expense: { value: number; category: ExpenseCategory; description: string }) => {
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

    // Calcular projeção
    const proj = calculateSimpleProjection(monthlyIncome, expense.value);
    setProjection({
      projectedBalance: proj.projectedBalance,
      daysUntilNegative: proj.daysUntilNegative,
      isPositive: proj.isPositive,
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
