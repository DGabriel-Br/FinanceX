import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface UseSubscriptionReturn {
  loading: boolean;
  hasActiveSubscription: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

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
        setHasActiveSubscription(data === true);
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
