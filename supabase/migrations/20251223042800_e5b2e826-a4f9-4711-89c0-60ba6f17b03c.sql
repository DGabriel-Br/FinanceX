-- Adicionar user_id às tabelas existentes
ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.debts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.investment_goals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remover constraint unique antiga de investment_goals e adicionar nova com user_id
ALTER TABLE public.investment_goals DROP CONSTRAINT IF EXISTS investment_goals_type_key;
ALTER TABLE public.investment_goals ADD CONSTRAINT investment_goals_user_type_unique UNIQUE (user_id, type);

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow public read access on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public insert access on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public update access on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public delete access on transactions" ON public.transactions;

DROP POLICY IF EXISTS "Allow public read access on debts" ON public.debts;
DROP POLICY IF EXISTS "Allow public insert access on debts" ON public.debts;
DROP POLICY IF EXISTS "Allow public update access on debts" ON public.debts;
DROP POLICY IF EXISTS "Allow public delete access on debts" ON public.debts;

DROP POLICY IF EXISTS "Allow public read access on investment_goals" ON public.investment_goals;
DROP POLICY IF EXISTS "Allow public insert access on investment_goals" ON public.investment_goals;
DROP POLICY IF EXISTS "Allow public update access on investment_goals" ON public.investment_goals;
DROP POLICY IF EXISTS "Allow public delete access on investment_goals" ON public.investment_goals;

-- Criar novas políticas RLS por usuário para transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Criar novas políticas RLS por usuário para debts
CREATE POLICY "Users can view their own debts"
ON public.debts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts"
ON public.debts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
ON public.debts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
ON public.debts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Criar novas políticas RLS por usuário para investment_goals
CREATE POLICY "Users can view their own goals"
ON public.investment_goals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.investment_goals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.investment_goals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.investment_goals FOR DELETE
TO authenticated
USING (auth.uid() = user_id);