-- Add NOT NULL constraints to user_id columns for data integrity
-- First verify no NULL values exist (already confirmed via query)

-- Add NOT NULL constraint to transactions.user_id
ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL;

-- Add NOT NULL constraint to debts.user_id
ALTER TABLE public.debts ALTER COLUMN user_id SET NOT NULL;

-- Add NOT NULL constraint to investment_goals.user_id
ALTER TABLE public.investment_goals ALTER COLUMN user_id SET NOT NULL;