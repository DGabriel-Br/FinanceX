-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 6. RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.is_admin());

-- 7. Create profiles table for user management
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    last_sign_in_at timestamp with time zone,
    is_blocked boolean NOT NULL DEFAULT false,
    blocked_at timestamp with time zone,
    blocked_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin());

-- 8. Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.created_at
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Trigger to update last_sign_in_at
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 10. Admin metrics functions (security definer to bypass RLS)

-- Get total users count
CREATE OR REPLACE FUNCTION public.admin_get_total_users()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles WHERE NOT is_blocked
$$;

-- Get users active today
CREATE OR REPLACE FUNCTION public.admin_get_active_users_today()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles 
  WHERE last_sign_in_at >= CURRENT_DATE 
  AND NOT is_blocked
$$;

-- Get users active last 7 days
CREATE OR REPLACE FUNCTION public.admin_get_active_users_week()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles 
  WHERE last_sign_in_at >= CURRENT_DATE - INTERVAL '7 days'
  AND NOT is_blocked
$$;

-- Get transactions created today
CREATE OR REPLACE FUNCTION public.admin_get_transactions_today()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.transactions 
  WHERE date = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
$$;

-- Get total volume today
CREATE OR REPLACE FUNCTION public.admin_get_volume_today()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(value), 0) FROM public.transactions 
  WHERE date = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
$$;

-- Get audit events today
CREATE OR REPLACE FUNCTION public.admin_get_audit_events_today()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.audit_log 
  WHERE created_at >= CURRENT_DATE
$$;

-- Get all users for admin list
CREATE OR REPLACE FUNCTION public.admin_get_users_list()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  is_blocked boolean,
  transaction_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.created_at,
    p.last_sign_in_at,
    p.is_blocked,
    COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.user_id = p.id), 0) as transaction_count
  FROM public.profiles p
  ORDER BY p.created_at DESC
$$;

-- Get financial activity stats
CREATE OR REPLACE FUNCTION public.admin_get_financial_stats()
RETURNS TABLE (
  total_transactions bigint,
  active_users_with_transactions bigint,
  total_users bigint,
  avg_transactions_per_user numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.transactions) as total_transactions,
    (SELECT COUNT(DISTINCT user_id) FROM public.transactions) as active_users_with_transactions,
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    ROUND(
      (SELECT COUNT(*)::numeric FROM public.transactions) / 
      NULLIF((SELECT COUNT(DISTINCT user_id) FROM public.transactions), 0), 
      2
    ) as avg_transactions_per_user
$$;

-- Get transactions per day (last 30 days)
CREATE OR REPLACE FUNCTION public.admin_get_transactions_by_day()
RETURNS TABLE (
  date text,
  count bigint,
  volume numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.date,
    COUNT(*) as count,
    SUM(t.value) as volume
  FROM public.transactions t
  WHERE t.date >= TO_CHAR(CURRENT_DATE - INTERVAL '30 days', 'YYYY-MM-DD')
  GROUP BY t.date
  ORDER BY t.date DESC
$$;

-- Get recent audit events
CREATE OR REPLACE FUNCTION public.admin_get_recent_audit_events(limit_count integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  table_name text,
  action text,
  record_id uuid,
  user_id uuid,
  created_at timestamp with time zone,
  changed_fields text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.table_name,
    a.action,
    a.record_id,
    a.user_id,
    a.created_at,
    a.changed_fields
  FROM public.audit_log a
  ORDER BY a.created_at DESC
  LIMIT limit_count
$$;

-- Block user function
CREATE OR REPLACE FUNCTION public.admin_block_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  UPDATE public.profiles
  SET is_blocked = true, blocked_at = now(), blocked_by = auth.uid()
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$;

-- Unblock user function
CREATE OR REPLACE FUNCTION public.admin_unblock_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  UPDATE public.profiles
  SET is_blocked = false, blocked_at = null, blocked_by = null
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$;