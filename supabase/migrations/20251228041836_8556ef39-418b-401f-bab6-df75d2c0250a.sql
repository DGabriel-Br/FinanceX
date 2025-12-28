-- Function to list all admin users
CREATE OR REPLACE FUNCTION public.admin_get_all_admins()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  role_created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ur.user_id,
    p.email,
    p.full_name,
    ur.created_at as role_created_at
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at DESC
$$;

-- Function to add admin role to a user
CREATE OR REPLACE FUNCTION public.admin_add_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Check if user already has admin role
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'User already has admin role';
  END IF;
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
  
  RETURN true;
END;
$$;

-- Function to remove admin role from a user
CREATE OR REPLACE FUNCTION public.admin_remove_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Prevent removing your own admin role
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove your own admin role';
  END IF;
  
  -- Remove admin role
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = 'admin';
  
  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_get_all_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_add_admin_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_admin_role(uuid) TO authenticated;