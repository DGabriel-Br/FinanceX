-- Create email_tracking table to store open events
CREATE TABLE public.email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  user_id UUID,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- Block all direct access (only edge functions can write)
CREATE POLICY "Block all direct access to email_tracking"
  ON public.email_tracking
  FOR ALL
  USING (false);

-- Create index for faster queries
CREATE INDEX idx_email_tracking_email_id ON public.email_tracking(email_id);
CREATE INDEX idx_email_tracking_recipient ON public.email_tracking(recipient_email);
CREATE INDEX idx_email_tracking_type ON public.email_tracking(email_type);
CREATE INDEX idx_email_tracking_opened_at ON public.email_tracking(opened_at);

-- Add tracking_id column to scheduled_emails for linking
ALTER TABLE public.scheduled_emails ADD COLUMN IF NOT EXISTS tracking_id UUID DEFAULT gen_random_uuid();