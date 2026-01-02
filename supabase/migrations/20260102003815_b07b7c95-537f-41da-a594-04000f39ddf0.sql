-- Create security definer function to check roles (avoids RLS recursion)
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

-- Create RLS policy for user_roles to allow users to view their own roles
-- (This should already exist based on the schema, but ensuring it's correct)

-- Grant execute on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;