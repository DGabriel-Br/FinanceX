import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPeriod } from '@/contexts/AdminPeriodContext';

export interface OverviewMetrics {
  totalUsers: number;
  activeUsersInRange: number;
  transactionsInRange: number;
  volumeInRange: number;
  totalIncome: number;
  totalExpense: number;
  auditEventsInRange: number;
  activeUsersWithTransactions: number;
  avgTransactionValue: number;
}

export interface UserListItem {
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_blocked: boolean;
  transaction_count: number;
}

export interface TransactionByDay {
  date: string;
  count: number;
  volume: number;
}

export interface AuditEvent {
  id: string;
  table_name: string;
  action: string;
  record_id: string;
  user_id: string;
  created_at: string;
  changed_fields: string[] | null;
}

export const useOverviewMetrics = () => {
  const { startDateStr, endDateStr, startTimestamp, endTimestamp, dateRange } = useAdminPeriod();

  return useQuery({
    queryKey: ['admin', 'overview', startDateStr, endDateStr],
    queryFn: async (): Promise<OverviewMetrics> => {
      // If no range selected (maximum), use all-time queries
      const useRange = !!dateRange;
      
      const [
        totalUsersResult,
        activeUsersResult,
        transactionsResult,
        volumeResult,
        auditEventsResult,
        financialStatsResult,
      ] = await Promise.all([
        supabase.rpc('admin_get_total_users'),
        useRange && startTimestamp && endTimestamp
          ? supabase.rpc('admin_get_active_users_in_range', {
              start_date: startTimestamp.toISOString(),
              end_date: endTimestamp.toISOString(),
            })
          : supabase.rpc('admin_get_total_users'), // All active users
        useRange && startDateStr && endDateStr
          ? supabase.rpc('admin_get_transactions_in_range', {
              start_date: startDateStr,
              end_date: endDateStr,
            })
          : supabase.from('transactions').select('*', { count: 'exact', head: true }),
        useRange && startDateStr && endDateStr
          ? supabase.rpc('admin_get_volume_in_range', {
              start_date: startDateStr,
              end_date: endDateStr,
            })
          : supabase.from('transactions').select('value').then(res => ({
              data: res.data?.reduce((sum, t) => sum + Number(t.value), 0) || 0,
              error: res.error
            })),
        useRange && startTimestamp && endTimestamp
          ? supabase.rpc('admin_get_audit_events_in_range', {
              start_date: startTimestamp.toISOString(),
              end_date: endTimestamp.toISOString(),
            })
          : supabase.from('audit_log').select('*', { count: 'exact', head: true }),
        useRange && startDateStr && endDateStr
          ? supabase.rpc('admin_get_financial_stats_in_range', {
              start_date: startDateStr,
              end_date: endDateStr,
            })
          : supabase.rpc('admin_get_financial_stats'),
      ]);

      const financialStats = Array.isArray(financialStatsResult.data) 
        ? financialStatsResult.data[0] 
        : financialStatsResult.data;

      // Handle both old and new function return types
      const totalIncome = (financialStats as any)?.total_income ?? 0;
      const totalExpense = (financialStats as any)?.total_expense ?? 0;
      const avgTransactionValue = (financialStats as any)?.avg_transaction_value ?? 0;

      return {
        totalUsers: totalUsersResult.data ?? 0,
        activeUsersInRange: activeUsersResult.data ?? 0,
        transactionsInRange: typeof transactionsResult.data === 'number' 
          ? transactionsResult.data 
          : (transactionsResult as any).count ?? 0,
        volumeInRange: typeof volumeResult.data === 'number' 
          ? volumeResult.data 
          : volumeResult.data ?? 0,
        totalIncome,
        totalExpense,
        auditEventsInRange: typeof auditEventsResult.data === 'number'
          ? auditEventsResult.data
          : (auditEventsResult as any).count ?? 0,
        activeUsersWithTransactions: financialStats?.active_users_with_transactions ?? 0,
        avgTransactionValue,
      };
    },
    refetchInterval: 60000,
  });
};

export const useUsersList = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<UserListItem[]> => {
      const { data, error } = await supabase.rpc('admin_get_users_list');
      if (error) throw error;
      return (data as UserListItem[]) ?? [];
    },
  });
};

export const useTransactionsByDay = () => {
  const { startDateStr, endDateStr, dateRange } = useAdminPeriod();

  return useQuery({
    queryKey: ['admin', 'transactions-by-day', startDateStr, endDateStr],
    queryFn: async (): Promise<TransactionByDay[]> => {
      if (dateRange && startDateStr && endDateStr) {
        const { data, error } = await supabase.rpc('admin_get_transactions_by_day_in_range', {
          start_date: startDateStr,
          end_date: endDateStr,
        });
        if (error) throw error;
        return (data as TransactionByDay[]) ?? [];
      } else {
        const { data, error } = await supabase.rpc('admin_get_transactions_by_day');
        if (error) throw error;
        return (data as TransactionByDay[]) ?? [];
      }
    },
  });
};

export const useRecentAuditEvents = (limit: number = 20) => {
  return useQuery({
    queryKey: ['admin', 'audit-events', limit],
    queryFn: async (): Promise<AuditEvent[]> => {
      const { data, error } = await supabase.rpc('admin_get_recent_audit_events', {
        limit_count: limit,
      });
      if (error) throw error;
      return (data as AuditEvent[]) ?? [];
    },
  });
};

export const useBlockUser = () => {
  const blockUser = async (userId: string) => {
    const { error } = await supabase.rpc('admin_block_user', {
      target_user_id: userId,
    });
    if (error) throw error;
  };

  const unblockUser = async (userId: string) => {
    const { error } = await supabase.rpc('admin_unblock_user', {
      target_user_id: userId,
    });
    if (error) throw error;
  };

  return { blockUser, unblockUser };
};
