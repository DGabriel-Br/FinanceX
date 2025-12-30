-- Bloqueia inserções diretas no audit_log
-- O trigger audit_log_trigger() com SECURITY DEFINER já faz as inserções de forma segura
CREATE POLICY "Block direct inserts to audit_log"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Também bloqueia para usuários anônimos
CREATE POLICY "Block anonymous inserts to audit_log"
ON public.audit_log
FOR INSERT
TO anon
WITH CHECK (false);