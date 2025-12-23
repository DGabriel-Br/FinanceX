-- Tabela de transações
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Tabela de dívidas
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  paid_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de metas de investimento
CREATE TABLE public.investment_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS (acesso público para leitura/escrita)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (sem autenticação)
CREATE POLICY "Allow public read access on transactions"
ON public.transactions FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access on transactions"
ON public.transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access on transactions"
ON public.transactions FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access on transactions"
ON public.transactions FOR DELETE
USING (true);

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