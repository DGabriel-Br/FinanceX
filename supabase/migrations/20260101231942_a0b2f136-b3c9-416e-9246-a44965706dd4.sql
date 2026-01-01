-- Corrigir view profiles_safe para usar SECURITY INVOKER (padrão)
-- Remove a view anterior e recria sem SECURITY DEFINER
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  created_at,
  is_blocked,
  last_sign_in_at
FROM public.profiles;