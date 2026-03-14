-- Add missing columns to registered_teams table

-- Add registration_form_url column
ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS registration_form_url text;

-- Add member contact columns  
ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member2_contact text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member3_contact text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member4_contact text;

-- Add member5 columns (for 4th team member - 5th person including leader)
ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_name text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_email text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_contact text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_role text;

-- Add location columns
ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS state text;

-- Ensure we have the proper column order for future querying
-- The table now supports all fields used by the register-team edge function
