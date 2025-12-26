-- Create table to store category order for both default and custom categories
CREATE TABLE public.category_order (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_key TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_key, type)
);

-- Enable Row Level Security
ALTER TABLE public.category_order ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own category order" 
ON public.category_order 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category order" 
ON public.category_order 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category order" 
ON public.category_order 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category order" 
ON public.category_order 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_category_order_user_type ON public.category_order(user_id, type);