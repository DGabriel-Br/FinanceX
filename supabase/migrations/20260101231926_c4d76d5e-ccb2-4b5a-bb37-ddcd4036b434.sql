-- =============================================
-- NÍVEL 1 - CORREÇÕES CRÍTICAS DE SEGURANÇA
-- =============================================

-- 1.1 Habilitar RLS na tabela password_setup_tokens
-- Bloqueia TODO acesso direto - apenas edge functions com service_role podem acessar
ALTER TABLE public.password_setup_tokens ENABLE ROW LEVEL SECURITY;

-- Política que bloqueia qualquer acesso direto (tokens só via service_role)
CREATE POLICY "Block all direct access to password_setup_tokens"
ON public.password_setup_tokens
FOR ALL
USING (false);

-- 1.2 Adicionar políticas de escrita em subscriptions
-- Bloqueia INSERT, UPDATE, DELETE diretos - apenas webhook com service_role pode modificar
CREATE POLICY "Block direct inserts to subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct updates to subscriptions"
ON public.subscriptions
FOR UPDATE
USING (false);

CREATE POLICY "Block direct deletes to subscriptions"
ON public.subscriptions
FOR DELETE
USING (false);

-- 1.3 Criar tabela para rate limiting de emails
CREATE TABLE IF NOT EXISTS public.email_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para queries eficientes
CREATE INDEX idx_email_rate_limits_lookup 
ON public.email_rate_limits (email, action, created_at DESC);

-- RLS para email_rate_limits - apenas service_role pode acessar
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all direct access to email_rate_limits"
ON public.email_rate_limits
FOR ALL
USING (false);

-- Limpar registros antigos automaticamente (mais de 1 hora)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.email_rate_limits
  WHERE created_at < now() - interval '1 hour';
END;
$$;

-- =============================================
-- NÍVEL 2 - CORREÇÕES DE ALTA PRIORIDADE
-- =============================================

-- 2.1 Revogar EXECUTE de funções admin para PUBLIC
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.check_user_blocked(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_user_blocked(uuid) TO authenticated;

-- 2.4 Atualizar função delete_user_account para limpeza completa
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user data from all tables
  DELETE FROM public.transactions WHERE user_id = current_user_id;
  DELETE FROM public.debts WHERE user_id = current_user_id;
  DELETE FROM public.investment_goals WHERE user_id = current_user_id;
  DELETE FROM public.custom_categories WHERE user_id = current_user_id;
  DELETE FROM public.category_order WHERE user_id = current_user_id;
  DELETE FROM public.hidden_default_categories WHERE user_id = current_user_id;
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  DELETE FROM public.analytics_events WHERE user_id = current_user_id;
  DELETE FROM public.audit_log WHERE user_id = current_user_id;
  DELETE FROM public.subscriptions WHERE user_id = current_user_id;
  DELETE FROM public.password_setup_tokens WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- Note: Storage avatars should be deleted via edge function before calling this
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RETURN true;
END;
$$;

-- =============================================
-- NÍVEL 3 - MELHORIAS DE SEGURANÇA
-- =============================================

-- 3.2 Criar view segura para profiles sem expor blocked_by
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT 
  id,
  full_name,
  created_at,
  is_blocked,
  last_sign_in_at
FROM public.profiles;

-- 3.3 Melhorar validação de datas nos triggers
CREATE OR REPLACE FUNCTION public.validate_transaction_values()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validar que o valor é positivo e dentro dos limites
  IF NEW.value IS NULL OR NEW.value <= 0 THEN
    RAISE EXCEPTION 'O valor da transação deve ser maior que zero';
  END IF;
  
  IF NEW.value > 999999999.99 THEN
    RAISE EXCEPTION 'O valor máximo permitido é R$ 999.999.999,99';
  END IF;
  
  -- Validar tipo
  IF NEW.type NOT IN ('receita', 'despesa') THEN
    RAISE EXCEPTION 'Tipo de transação inválido. Use "receita" ou "despesa"';
  END IF;
  
  -- Validar que categoria não está vazia
  IF NEW.category IS NULL OR TRIM(NEW.category) = '' THEN
    RAISE EXCEPTION 'A categoria é obrigatória';
  END IF;
  
  -- Validar que descrição não está vazia
  IF NEW.description IS NULL OR TRIM(NEW.description) = '' THEN
    RAISE EXCEPTION 'A descrição é obrigatória';
  END IF;
  
  -- Validar tamanho da descrição
  IF LENGTH(NEW.description) > 200 THEN
    RAISE EXCEPTION 'A descrição deve ter no máximo 200 caracteres';
  END IF;
  
  -- Validar data usando cast (mais robusto que regex)
  BEGIN
    PERFORM NEW.date::date;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Formato de data inválido. Use YYYY-MM-DD';
  END;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_debt_values()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validar valor total
  IF NEW.total_value IS NULL OR NEW.total_value <= 0 THEN
    RAISE EXCEPTION 'O valor total da dívida deve ser maior que zero';
  END IF;
  
  IF NEW.total_value > 999999999.99 THEN
    RAISE EXCEPTION 'O valor máximo permitido é R$ 999.999.999,99';
  END IF;
  
  -- Validar parcela mensal
  IF NEW.monthly_installment IS NULL OR NEW.monthly_installment <= 0 THEN
    RAISE EXCEPTION 'A parcela mensal deve ser maior que zero';
  END IF;
  
  IF NEW.monthly_installment > NEW.total_value THEN
    RAISE EXCEPTION 'A parcela mensal não pode ser maior que o valor total';
  END IF;
  
  -- Validar valor pago
  IF NEW.paid_value IS NULL THEN
    NEW.paid_value := 0;
  END IF;
  
  IF NEW.paid_value < 0 THEN
    RAISE EXCEPTION 'O valor pago não pode ser negativo';
  END IF;
  
  IF NEW.paid_value > NEW.total_value THEN
    RAISE EXCEPTION 'O valor pago não pode ser maior que o valor total';
  END IF;
  
  -- Validar nome
  IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
    RAISE EXCEPTION 'O nome da dívida é obrigatório';
  END IF;
  
  IF LENGTH(NEW.name) > 100 THEN
    RAISE EXCEPTION 'O nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validar data usando cast (mais robusto que regex)
  BEGIN
    PERFORM NEW.start_date::date;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Formato de data inválido. Use YYYY-MM-DD';
  END;
  
  RETURN NEW;
END;
$$;