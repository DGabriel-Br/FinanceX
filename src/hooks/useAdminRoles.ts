import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string | null;
  role_created_at: string;
}

export const useAdminsList = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_all_admins');
      if (error) throw error;
      return data as AdminUser[];
    },
  });
};

export const useManageAdminRole = () => {
  const queryClient = useQueryClient();

  const addAdminRole = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('admin_add_admin_role', {
        target_user_id: userId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
  });

  const removeAdminRole = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('admin_remove_admin_role', {
        target_user_id: userId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
  });

  return { addAdminRole, removeAdminRole };
};

interface SyncResult {
  synced_count: number;
  synced_emails: string[];
}

export const useSyncMissingProfiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('admin_sync_missing_profiles');
      if (error) throw error;
      return data as SyncResult[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
