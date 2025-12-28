-- Remove a coluna email da tabela profiles (dados sensíveis devem vir de auth.users)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Atualiza função handle_new_user para não inserir email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.created_at
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Atualiza admin_get_users_list para buscar email de auth.users
CREATE OR REPLACE FUNCTION public.admin_get_users_list()
RETURNS TABLE(
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
    au.email,
    p.full_name,
    p.created_at,
    p.last_sign_in_at,
    p.is_blocked,
    COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.user_id = p.id), 0) as transaction_count
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC
$$;

-- Atualiza admin_get_all_admins para buscar email de auth.users
CREATE OR REPLACE FUNCTION public.admin_get_all_admins()
RETURNS TABLE(user_id uuid, email text, full_name text, role_created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ur.user_id,
    au.email,
    p.full_name,
    ur.created_at as role_created_at
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at DESC
$$;

-- Atualiza get_my_profile para buscar email de auth.users
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE(id uuid, email text, full_name text, created_at timestamp with time zone, is_blocked boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    au.email,
    p.full_name,
    p.created_at,
    p.is_blocked
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = auth.uid()
$$;

-- Atualiza admin_sync_missing_profiles para não sincronizar email
CREATE OR REPLACE FUNCTION public.admin_sync_missing_profiles()
RETURNS TABLE(synced_count integer, synced_emails text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _synced_count integer := 0;
  _synced_emails text[] := ARRAY[]::text[];
  _user record;
BEGIN
  -- Check admin permission
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Find users without profiles and create them
  FOR _user IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data ->> 'full_name' as full_name,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.id IS NULL
  LOOP
    -- Insert missing profile (sem email)
    INSERT INTO public.profiles (id, full_name, created_at)
    VALUES (_user.id, _user.full_name, _user.created_at);
    
    -- Also ensure user has the default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    _synced_count := _synced_count + 1;
    _synced_emails := array_append(_synced_emails, _user.email);
  END LOOP;
  
  RETURN QUERY SELECT _synced_count, _synced_emails;
END;
$$;