-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for debts table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.debts;

-- Enable realtime for investment_goals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.investment_goals;