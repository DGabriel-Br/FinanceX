import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'financex_onboarding_v2';
const ONBOARDING_VERSION = '2.0'; // Version 2: Action-first onboarding

interface OnboardingState {
  completed: boolean;
  version: string;
  completedAt?: string;
  incomeAdded?: boolean;
  firstExpenseAdded?: boolean;
  sawProjection?: boolean;
}

export const useOnboarding = (userId: string | undefined) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate storage key per user
  const getStorageKey = useCallback(() => {
    return userId ? `${ONBOARDING_KEY}_${userId}` : ONBOARDING_KEY;
  }, [userId]);

  // Check if onboarding was completed
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const checkOnboardingStatus = () => {
      try {
        const stored = localStorage.getItem(getStorageKey());
        
        if (stored) {
          const state: OnboardingState = JSON.parse(stored);
          
          // Show onboarding again if version changed
          if (state.version !== ONBOARDING_VERSION) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(!state.completed);
          }
        } else {
          // First time user
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to let the page load first
    const timer = setTimeout(checkOnboardingStatus, 300);
    return () => clearTimeout(timer);
  }, [userId, getStorageKey]);

  const completeOnboarding = useCallback(() => {
    const state: OnboardingState = {
      completed: true,
      version: ONBOARDING_VERSION,
      completedAt: new Date().toISOString(),
      incomeAdded: true,
      firstExpenseAdded: true,
      sawProjection: true,
    };
    
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    
    setShowOnboarding(false);
  }, [getStorageKey]);

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
    setShowOnboarding(true);
  }, [getStorageKey]);

  return {
    showOnboarding,
    showTour: showOnboarding, // Alias for backward compatibility
    isLoading,
    completeOnboarding,
    completeTour: completeOnboarding, // Alias for backward compatibility
    skipTour: completeOnboarding, // Alias for backward compatibility
    resetOnboarding,
    resetTour: resetOnboarding, // Alias for backward compatibility
  };
};
