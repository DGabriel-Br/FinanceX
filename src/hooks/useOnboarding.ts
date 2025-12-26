import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'financex_onboarding_completed';
const ONBOARDING_VERSION = '1.0'; // Increment to show tour again after major updates

interface OnboardingState {
  completed: boolean;
  version: string;
  completedAt?: string;
}

export const useOnboarding = (userId: string | undefined) => {
  const [showTour, setShowTour] = useState(false);
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
          
          // Show tour again if version changed (new features added)
          if (state.version !== ONBOARDING_VERSION) {
            setShowTour(true);
          } else {
            setShowTour(false);
          }
        } else {
          // First time user
          setShowTour(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setShowTour(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to let the page load first
    const timer = setTimeout(checkOnboardingStatus, 500);
    return () => clearTimeout(timer);
  }, [userId, getStorageKey]);

  const completeTour = useCallback(() => {
    const state: OnboardingState = {
      completed: true,
      version: ONBOARDING_VERSION,
      completedAt: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    
    setShowTour(false);
  }, [getStorageKey]);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
    setShowTour(true);
  }, [getStorageKey]);

  return {
    showTour,
    isLoading,
    completeTour,
    skipTour,
    resetTour,
  };
};
