-- Adicionar coluna para valor já pago na tabela de dívidas
ALTER TABLE public.debts 
ADD COLUMN paid_value numeric NOT NULL DEFAULT 0;