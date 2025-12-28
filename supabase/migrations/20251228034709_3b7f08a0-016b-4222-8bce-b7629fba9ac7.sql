-- ============================================
-- SISTEMA DE AUDIT LOG PARA COMPLIANCE FINANCEIRO
-- ============================================

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  user_id uuid NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON public.audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- Habilitar RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários só podem ver seus próprios logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas o sistema pode inserir logs (via trigger SECURITY DEFINER)
CREATE POLICY "System can insert audit logs"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (true);

-- Ninguém pode atualizar ou deletar logs (imutabilidade para compliance)
-- Não criamos políticas de UPDATE/DELETE, então são bloqueadas por padrão

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data_json jsonb;
  new_data_json jsonb;
  changed_cols text[];
  col text;
  target_user_id uuid;
BEGIN
  -- Determinar o user_id baseado na operação
  IF TG_OP = 'DELETE' THEN
    old_data_json := to_jsonb(OLD);
    new_data_json := NULL;
    target_user_id := OLD.user_id;
    changed_cols := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data_json := NULL;
    new_data_json := to_jsonb(NEW);
    target_user_id := NEW.user_id;
    changed_cols := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data_json := to_jsonb(OLD);
    new_data_json := to_jsonb(NEW);
    target_user_id := NEW.user_id;
    
    -- Identificar campos alterados
    changed_cols := ARRAY[]::text[];
    FOR col IN SELECT jsonb_object_keys(new_data_json)
    LOOP
      IF (old_data_json -> col) IS DISTINCT FROM (new_data_json -> col) THEN
        changed_cols := array_append(changed_cols, col);
      END IF;
    END LOOP;
  END IF;
  
  -- Inserir registro de auditoria
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    old_data_json,
    new_data_json,
    changed_cols,
    target_user_id
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers de auditoria para transactions
DROP TRIGGER IF EXISTS audit_transactions_insert ON public.transactions;
CREATE TRIGGER audit_transactions_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_transactions_update ON public.transactions;
CREATE TRIGGER audit_transactions_update
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_transactions_delete ON public.transactions;
CREATE TRIGGER audit_transactions_delete
  AFTER DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

-- Triggers de auditoria para debts
DROP TRIGGER IF EXISTS audit_debts_insert ON public.debts;
CREATE TRIGGER audit_debts_insert
  AFTER INSERT ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_debts_update ON public.debts;
CREATE TRIGGER audit_debts_update
  AFTER UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_debts_delete ON public.debts;
CREATE TRIGGER audit_debts_delete
  AFTER DELETE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

-- Triggers de auditoria para investment_goals
DROP TRIGGER IF EXISTS audit_investment_goals_insert ON public.investment_goals;
CREATE TRIGGER audit_investment_goals_insert
  AFTER INSERT ON public.investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_investment_goals_update ON public.investment_goals;
CREATE TRIGGER audit_investment_goals_update
  AFTER UPDATE ON public.investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_investment_goals_delete ON public.investment_goals;
CREATE TRIGGER audit_investment_goals_delete
  AFTER DELETE ON public.investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();