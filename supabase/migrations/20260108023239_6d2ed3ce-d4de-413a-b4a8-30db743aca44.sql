-- Recriar a view profiles_safe com security_invoker para herdar RLS da tabela profiles
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  created_at,
  last_sign_in_at,
  is_blocked
FROM public.profiles;