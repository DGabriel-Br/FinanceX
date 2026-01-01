-- =====================================================
-- Migração 2: Backfill updated_at e criar triggers
-- =====================================================

-- 1. Backfill: setar updated_at = created_at onde estiver nulo (transactions)
UPDATE public.transactions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 2. Backfill: setar updated_at = created_at onde estiver nulo (debts)
UPDATE public.debts 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 3. Backfill: setar updated_at = created_at onde estiver nulo (investment_goals)
UPDATE public.investment_goals 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 4. Criar função para atualizar updated_at em tabelas com bigint (ms)
CREATE OR REPLACE FUNCTION public.update_updated_at_bigint()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5. Criar trigger para transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_bigint();

-- 6. Criar trigger para debts
DROP TRIGGER IF EXISTS update_debts_updated_at ON public.debts;
CREATE TRIGGER update_debts_updated_at
BEFORE UPDATE ON public.debts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_bigint();

-- 7. Criar trigger para investment_goals (usa timestamp, já existe função)
DROP TRIGGER IF EXISTS update_investment_goals_updated_at ON public.investment_goals;
CREATE TRIGGER update_investment_goals_updated_at
BEFORE UPDATE ON public.investment_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Criar índices para queries de sync incremental
CREATE INDEX IF NOT EXISTS idx_transactions_updated_at ON public.transactions(updated_at);
CREATE INDEX IF NOT EXISTS idx_debts_updated_at ON public.debts(updated_at);
CREATE INDEX IF NOT EXISTS idx_investment_goals_updated_at ON public.investment_goals(updated_at);