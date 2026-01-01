import { ReactNode } from 'react';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useOnboarding } from '@/hooks/useOnboarding';

type Tab = 'dashboard' | 'lancamentos' | 'investimentos' | 'dividas';

interface AppShellOnboardingGateProps {
  userId: string | undefined;
  children: ReactNode;
  onHighlightedTabChange: (tab: Tab | null) => void;
}

/**
 * Responsável por gerenciar o tour de onboarding
 */
export const AppShellOnboardingGate = ({ 
  userId, 
  children, 
  onHighlightedTabChange 
}: AppShellOnboardingGateProps) => {
  const { showTour, completeTour, skipTour } = useOnboarding(userId);

  return (
    <>
      {children}
      
      {showTour && (
        <OnboardingTour 
          onComplete={completeTour} 
          onSkip={skipTour}
          onStepChange={onHighlightedTabChange}
        />
      )}
    </>
  );
};

export const useOnboardingState = (userId: string | undefined) => {
  const { showTour } = useOnboarding(userId);
  return { showTour };
};
