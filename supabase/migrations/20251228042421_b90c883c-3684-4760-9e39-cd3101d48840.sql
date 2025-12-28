-- Function to sync missing profiles from auth.users
CREATE OR REPLACE FUNCTION public.admin_sync_missing_profiles()
RETURNS TABLE (
  synced_count integer,
  synced_emails text[]
)
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
    -- Insert missing profile
    INSERT INTO public.profiles (id, email, full_name, created_at)
    VALUES (_user.id, _user.email, _user.full_name, _user.created_at);
    
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_sync_missing_profiles() TO authenticated;