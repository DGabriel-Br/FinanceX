-- ============================================================
-- Migration: Converter updated_at de BIGINT(ms) para TIMESTAMPTZ
-- Padronizar NOT NULL, default now() e trigger em todas as tabelas
-- ============================================================

-- Desabilitar apenas triggers de usuário (não system triggers)
ALTER TABLE public.debts DISABLE TRIGGER USER;
ALTER TABLE public.transactions DISABLE TRIGGER USER;
ALTER TABLE public.investment_goals DISABLE TRIGGER USER;

-- 1. TRANSACTIONS: Converter updated_at BIGINT → TIMESTAMPTZ
ALTER TABLE public.transactions
  ADD COLUMN updated_at_new TIMESTAMPTZ;

UPDATE public.transactions
SET updated_at_new = to_timestamp(updated_at / 1000.0)
WHERE updated_at IS NOT NULL;

UPDATE public.transactions
SET updated_at_new = to_timestamp(created_at / 1000.0)
WHERE updated_at_new IS NULL AND created_at IS NOT NULL;

UPDATE public.transactions
SET updated_at_new = now()
WHERE updated_at_new IS NULL;

ALTER TABLE public.transactions DROP COLUMN updated_at;
ALTER TABLE public.transactions RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE public.transactions
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now();

-- 2. DEBTS: Converter updated_at BIGINT → TIMESTAMPTZ
ALTER TABLE public.debts
  ADD COLUMN updated_at_new TIMESTAMPTZ;

UPDATE public.debts
SET updated_at_new = to_timestamp(updated_at / 1000.0)
WHERE updated_at IS NOT NULL;

UPDATE public.debts
SET updated_at_new = to_timestamp(created_at / 1000.0)
WHERE updated_at_new IS NULL AND created_at IS NOT NULL;

UPDATE public.debts
SET updated_at_new = now()
WHERE updated_at_new IS NULL;

ALTER TABLE public.debts DROP COLUMN updated_at;
ALTER TABLE public.debts RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE public.debts
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now();

-- 3. INVESTMENT_GOALS: Já é TIMESTAMPTZ, apenas garantir NOT NULL e default
UPDATE public.investment_goals
SET updated_at = created_at
WHERE updated_at IS NULL;

UPDATE public.investment_goals
SET updated_at = now()
WHERE updated_at IS NULL;

ALTER TABLE public.investment_goals
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now();

-- Reabilitar triggers de usuário
ALTER TABLE public.debts ENABLE TRIGGER USER;
ALTER TABLE public.transactions ENABLE TRIGGER USER;
ALTER TABLE public.investment_goals ENABLE TRIGGER USER;

-- 4. Criar/atualizar trigger function para TIMESTAMPTZ
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5. Criar triggers para as 3 tabelas (dropar primeiro se existirem)
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_debts_updated_at ON public.debts;
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_investment_goals_updated_at ON public.investment_goals;
CREATE TRIGGER update_investment_goals_updated_at
  BEFORE UPDATE ON public.investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Criar índices para incremental sync com cursor composto (updated_at, id)
DROP INDEX IF EXISTS idx_transactions_updated_at;
DROP INDEX IF EXISTS idx_debts_updated_at;
DROP INDEX IF EXISTS idx_investment_goals_updated_at;

CREATE INDEX idx_transactions_sync_cursor ON public.transactions (updated_at ASC, id ASC);
CREATE INDEX idx_debts_sync_cursor ON public.debts (updated_at ASC, id ASC);
CREATE INDEX idx_investment_goals_sync_cursor ON public.investment_goals (updated_at ASC, id ASC);

-- 7. Remover a função antiga de bigint se existir
DROP FUNCTION IF EXISTS public.update_updated_at_bigint() CASCADE;