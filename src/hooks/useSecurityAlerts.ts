import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityAlerts {
  blockedUsersCount: number;
  hasAlerts: boolean;
}

export const useSecurityAlerts = () => {
  return useQuery({
    queryKey: ['security-alerts'],
    queryFn: async (): Promise<SecurityAlerts> => {
      const { data, error } = await supabase.rpc('admin_get_blocked_users_count');
      
      if (error) {
        console.error('Error fetching security alerts:', error);
        return { blockedUsersCount: 0, hasAlerts: false };
      }
      
      const blockedUsersCount = data ?? 0;
      
      return {
        blockedUsersCount,
        hasAlerts: blockedUsersCount > 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};
