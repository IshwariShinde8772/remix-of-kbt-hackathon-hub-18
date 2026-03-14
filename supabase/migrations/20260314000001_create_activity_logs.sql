-- Create activity_logs table for tracking all registrations and submissions

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  action text NOT NULL, -- 'registration', 'solution_submission', etc.
  team_id text NOT NULL,
  user_email text,
  details jsonb, -- Additional info as JSON
  status text NOT NULL DEFAULT 'success', -- 'success', 'failed', 'pending'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write
CREATE POLICY "Anyone can log activity"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Activity logs are viewable"
  ON public.activity_logs FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON public.activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.activity_logs;
