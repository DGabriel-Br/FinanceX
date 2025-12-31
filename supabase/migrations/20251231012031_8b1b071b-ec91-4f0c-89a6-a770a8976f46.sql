-- First drop the RLS policies that depend on is_admin()
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Now remove admin RPC functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

DROP FUNCTION IF EXISTS public.admin_get_total_users();
DROP FUNCTION IF EXISTS public.admin_get_active_users_today();
DROP FUNCTION IF EXISTS public.admin_get_active_users_week();
DROP FUNCTION IF EXISTS public.admin_get_transactions_today();
DROP FUNCTION IF EXISTS public.admin_get_volume_today();
DROP FUNCTION IF EXISTS public.admin_get_audit_events_today();
DROP FUNCTION IF EXISTS public.admin_get_financial_stats();
DROP FUNCTION IF EXISTS public.admin_get_transactions_by_day();
DROP FUNCTION IF EXISTS public.admin_get_recent_audit_events(integer);

DROP FUNCTION IF EXISTS public.admin_block_user(uuid);
DROP FUNCTION IF EXISTS public.admin_unblock_user(uuid);
DROP FUNCTION IF EXISTS public.admin_add_admin_role(uuid);
DROP FUNCTION IF EXISTS public.admin_remove_admin_role(uuid);
DROP FUNCTION IF EXISTS public.admin_get_all_admins();

DROP FUNCTION IF EXISTS public.admin_get_transactions_in_range(text, text);
DROP FUNCTION IF EXISTS public.admin_get_volume_in_range(text, text);
DROP FUNCTION IF EXISTS public.admin_get_active_users_in_range(timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS public.admin_get_audit_events_in_range(timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS public.admin_get_transactions_by_day_in_range(text, text);
DROP FUNCTION IF EXISTS public.admin_get_financial_stats_in_range(text, text);
DROP FUNCTION IF EXISTS public.admin_get_new_users_in_range(timestamp with time zone, timestamp with time zone);

DROP FUNCTION IF EXISTS public.admin_get_blocked_users_count();
DROP FUNCTION IF EXISTS public.admin_get_users_blocked_in_range(timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS public.admin_get_users_list();
DROP FUNCTION IF EXISTS public.admin_sync_missing_profiles();