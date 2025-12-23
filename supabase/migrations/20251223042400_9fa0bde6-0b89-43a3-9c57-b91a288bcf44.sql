-- Deletar tabela investment_goals antiga
DROP TABLE IF EXISTS public.investment_goals;

-- Recriar tabela investment_goals com estrutura correta para metas por tipo
CREATE TABLE public.investment_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  target_value DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.investment_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Allow public read access on investment_goals"
ON public.investment_goals FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access on investment_goals"
ON public.investment_goals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access on investment_goals"
ON public.investment_goals FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access on investment_goals"
ON public.investment_goals FOR DELETE
USING (true);

-- Atualizar tabela debts para corresponder ao tipo Debt existente
DROP TABLE IF EXISTS public.debts;

CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  monthly_installment DECIMAL(12,2) NOT NULL,
  start_date TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Habilitar RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Allow public read access on debts"
ON public.debts FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access on debts"
ON public.debts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access on debts"
ON public.debts FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access on debts"
ON public.debts FOR DELETE
USING (true);