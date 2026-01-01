-- =====================================================
-- Migração 1: Adicionar colunas updated_at
-- =====================================================

-- 1. Adicionar coluna updated_at na tabela transactions (bigint em ms)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS updated_at BIGINT DEFAULT ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint;

-- 2. Adicionar coluna updated_at na tabela debts (bigint em ms)
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS updated_at BIGINT DEFAULT ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint;

-- 3. Adicionar coluna updated_at na tabela investment_goals (timestamp)
ALTER TABLE public.investment_goals 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();