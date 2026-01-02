-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create scheduled_emails table
CREATE TABLE public.scheduled_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Block all direct access (only edge functions with service role can access)
CREATE POLICY "Block all direct access to scheduled_emails"
  ON public.scheduled_emails
  FOR ALL
  USING (false);

-- Create index for efficient querying of pending emails
CREATE INDEX idx_scheduled_emails_pending 
  ON public.scheduled_emails (scheduled_for, status) 
  WHERE status = 'pending';

-- Create index for user lookup
CREATE INDEX idx_scheduled_emails_user_id 
  ON public.scheduled_emails (user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_emails_updated_at
  BEFORE UPDATE ON public.scheduled_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();