-- Create analytics_events table for funnel tracking
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text NOT NULL,
  user_id uuid,
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  page_url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Restrict event_name to supported events only
  CONSTRAINT valid_event_name CHECK (
    event_name IN ('landing_viewed', 'signup_started', 'signup_completed', 'first_value', 'paywall_viewed')
  )
);

-- Create indexes for common query patterns
CREATE INDEX idx_analytics_events_event_created 
  ON public.analytics_events (event_name, created_at DESC);

CREATE INDEX idx_analytics_events_user_created 
  ON public.analytics_events (user_id, created_at DESC) 
  WHERE user_id IS NOT NULL;

CREATE INDEX idx_analytics_events_anonymous_created 
  ON public.analytics_events (anonymous_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for tracking before login)
CREATE POLICY "Allow anonymous event inserts" 
  ON public.analytics_events 
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Users can only view their own events (for potential future dashboards)
CREATE POLICY "Users can view their own events" 
  ON public.analytics_events 
  FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR anonymous_id = current_setting('request.headers', true)::json->>'x-anonymous-id'
  );

-- Add comment for documentation
COMMENT ON TABLE public.analytics_events IS 'Stores funnel analytics events for product metrics';
COMMENT ON COLUMN public.analytics_events.event_name IS 'Restricted to: landing_viewed, signup_started, signup_completed, first_value, paywall_viewed';