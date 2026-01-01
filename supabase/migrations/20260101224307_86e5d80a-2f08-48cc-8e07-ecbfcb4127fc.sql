-- Create password_setup_tokens table for secure password setup after checkout
CREATE TABLE public.password_setup_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  stripe_session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS - no policies means only service_role can access (maximum security)
ALTER TABLE public.password_setup_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_password_setup_tokens_email ON public.password_setup_tokens(email);
CREATE INDEX idx_password_setup_tokens_token ON public.password_setup_tokens(token);
CREATE INDEX idx_password_setup_tokens_stripe_session ON public.password_setup_tokens(stripe_session_id);