-- Create table to track hidden default categories per user
CREATE TABLE public.hidden_default_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_key TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_key, type)
);

-- Enable Row Level Security
ALTER TABLE public.hidden_default_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own hidden categories" 
ON public.hidden_default_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hidden categories" 
ON public.hidden_default_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hidden categories" 
ON public.hidden_default_categories 
FOR DELETE 
USING (auth.uid() = user_id);