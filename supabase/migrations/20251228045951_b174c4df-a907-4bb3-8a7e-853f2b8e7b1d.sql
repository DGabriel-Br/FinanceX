-- Function to get new users registered within a date range
CREATE OR REPLACE FUNCTION public.admin_get_new_users_in_range(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles 
  WHERE created_at >= start_date 
  AND created_at <= end_date
$$;

-- Function to get blocked users count
CREATE OR REPLACE FUNCTION public.admin_get_blocked_users_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles 
  WHERE is_blocked = true
$$;

-- Function to get users blocked within a date range
CREATE OR REPLACE FUNCTION public.admin_get_users_blocked_in_range(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles 
  WHERE is_blocked = true
  AND blocked_at >= start_date 
  AND blocked_at <= end_date
$$;