-- 1. Fix audit_log INSERT policy - only allow trigger inserts (not direct API)
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Revoke direct insert from anon and authenticated roles
-- Audit logs should only be created by triggers (which run as SECURITY DEFINER)
REVOKE INSERT ON public.audit_log FROM anon, authenticated;

-- 2. Fix profiles table - restrict access to sensitive fields

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create more restrictive policies
-- Users can only see their own profile (but we'll use a function to filter sensitive fields)
CREATE POLICY "Users can view own profile basic info"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update only their own profile (limited fields handled at app level)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

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

-- 3. Create secure function to get user's own profile without sensitive fields
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamp with time zone,
  is_blocked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.created_at,
    p.is_blocked
  FROM public.profiles p
  WHERE p.id = auth.uid()
$$;

-- 4. Create secure function to check if user is blocked (for login)
CREATE OR REPLACE FUNCTION public.check_user_blocked(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE id = user_id),
    false
  )
$$;

-- 5. Ensure INSERT on profiles is only via trigger
-- The trigger handle_new_user runs as SECURITY DEFINER so it can insert
REVOKE INSERT ON public.profiles FROM authenticated;

-- 6. Grant execute on safe functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_blocked(uuid) TO authenticated;