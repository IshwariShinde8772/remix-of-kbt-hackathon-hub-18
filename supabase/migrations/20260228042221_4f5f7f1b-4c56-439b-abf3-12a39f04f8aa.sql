
-- Create registered_teams table
CREATE TABLE public.registered_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id text NOT NULL UNIQUE,
  team_name text NOT NULL,
  college_name text NOT NULL,
  institute_number text NOT NULL,
  leader_name text NOT NULL,
  leader_email text NOT NULL,
  leader_phone text NOT NULL,
  member2_name text,
  member2_email text,
  member2_role text,
  member3_name text,
  member3_email text,
  member3_role text,
  member4_name text,
  member4_email text,
  member4_role text,
  selected_problem_id uuid REFERENCES public.problem_statements(id),
  selected_domain text,
  approach_description text,
  mentor_name text NOT NULL,
  mentor_email text NOT NULL,
  mentor_contact text NOT NULL,
  city text,
  state text,
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.registered_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a team"
  ON public.registered_teams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Teams are publicly viewable"
  ON public.registered_teams FOR SELECT
  USING (true);

-- Create submissions table
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id text NOT NULL REFERENCES public.registered_teams(team_id),
  problem_id uuid REFERENCES public.problem_statements(id),
  solution_pdf_url text NOT NULL,
  youtube_link text NOT NULL,
  description text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a solution"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Submissions are viewable"
  ON public.submissions FOR SELECT
  USING (true);

-- Create solutions storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('solutions', 'solutions', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow uploads to solutions bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'solutions');

CREATE POLICY "Allow reads from solutions bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'solutions');

-- Create sequence for team ID generation
CREATE SEQUENCE IF NOT EXISTS team_id_seq START WITH 1;

-- Function to auto-generate team_id
CREATE OR REPLACE FUNCTION public.generate_team_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_id IS NULL OR NEW.team_id = '' THEN
    NEW.team_id := 'KBT-' || LPAD(nextval('team_id_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_team_id
  BEFORE INSERT ON public.registered_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_team_id();

-- Trigger for updated_at
CREATE TRIGGER update_registered_teams_updated_at
  BEFORE UPDATE ON public.registered_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for problem_statements
ALTER PUBLICATION supabase_realtime ADD TABLE public.problem_statements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registered_teams;
