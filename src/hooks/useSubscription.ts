import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { track } from '@/infra/analytics';

interface UseSubscriptionReturn {
  loading: boolean;
  hasActiveSubscription: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const hasTrackedRef = useRef(false);

  const checkSubscription = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setHasActiveSubscription(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_active_subscription', {
        check_user_id: user.id
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setHasActiveSubscription(false);
      } else {
        const isActive = data === true;
        setHasActiveSubscription(isActive);
        
        // Track subscription verified only once per session
        if (isActive && !hasTrackedRef.current) {
          hasTrackedRef.current = true;
          track('subscription_verified');
        }
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial check
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Periodic refresh (every 60 seconds)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user?.id, checkSubscription]);

  return {
    loading,
    hasActiveSubscription,
    refetch: checkSubscription,
  };
}
