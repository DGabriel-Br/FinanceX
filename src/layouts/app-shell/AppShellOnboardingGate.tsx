import { ReactNode } from 'react';
import { OnboardingOverlay } from '@/components/onboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Transaction } from '@/types/transaction';

interface AppShellOnboardingGateProps {
  userId: string | undefined;
  children: ReactNode;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
}

/**
 * Responsável por gerenciar o onboarding focado em ação
 */
export const AppShellOnboardingGate = ({ 
  userId, 
  children, 
  onAddTransaction,
}: AppShellOnboardingGateProps) => {
  const { showOnboarding, completeOnboarding } = useOnboarding(userId);

  return (
    <>
      {children}
      
      {showOnboarding && (
        <OnboardingOverlay 
          onComplete={completeOnboarding} 
          onAddTransaction={onAddTransaction}
        />
      )}
    </>
  );
};

export const useOnboardingState = (userId: string | undefined) => {
  const { showOnboarding } = useOnboarding(userId);
  return { showOnboarding, showTour: showOnboarding };
};
