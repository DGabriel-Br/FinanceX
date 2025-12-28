import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OverviewMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  transactionsToday: number;
  volumeToday: number;
  auditEventsToday: number;
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

export interface FinancialStats {
  total_transactions: number;
  active_users_with_transactions: number;
  total_users: number;
  avg_transactions_per_user: number;
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
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async (): Promise<OverviewMetrics> => {
      const [
        totalUsersResult,
        activeUsersTodayResult,
        activeUsersWeekResult,
        transactionsTodayResult,
        volumeTodayResult,
        auditEventsTodayResult,
      ] = await Promise.all([
        supabase.rpc('admin_get_total_users'),
        supabase.rpc('admin_get_active_users_today'),
        supabase.rpc('admin_get_active_users_week'),
        supabase.rpc('admin_get_transactions_today'),
        supabase.rpc('admin_get_volume_today'),
        supabase.rpc('admin_get_audit_events_today'),
      ]);

      return {
        totalUsers: totalUsersResult.data ?? 0,
        activeUsersToday: activeUsersTodayResult.data ?? 0,
        activeUsersWeek: activeUsersWeekResult.data ?? 0,
        transactionsToday: transactionsTodayResult.data ?? 0,
        volumeToday: volumeTodayResult.data ?? 0,
        auditEventsToday: auditEventsTodayResult.data ?? 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
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

export const useFinancialStats = () => {
  return useQuery({
    queryKey: ['admin', 'financial-stats'],
    queryFn: async (): Promise<FinancialStats> => {
      const { data, error } = await supabase.rpc('admin_get_financial_stats');
      if (error) throw error;
      const result = (data as FinancialStats[])?.[0];
      return result ?? {
        total_transactions: 0,
        active_users_with_transactions: 0,
        total_users: 0,
        avg_transactions_per_user: 0,
      };
    },
  });
};

export const useTransactionsByDay = () => {
  return useQuery({
    queryKey: ['admin', 'transactions-by-day'],
    queryFn: async (): Promise<TransactionByDay[]> => {
      const { data, error } = await supabase.rpc('admin_get_transactions_by_day');
      if (error) throw error;
      return (data as TransactionByDay[]) ?? [];
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
