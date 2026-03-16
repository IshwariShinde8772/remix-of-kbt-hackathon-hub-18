-- ============================================================
-- EXTERNAL DATABASE FIX
-- Run this in External Supabase SQL Editor
-- https://supabase.com/dashboard/project/lxawemydhhmqjahttrlb/sql
-- ============================================================

-- 1. Add team_id column if it doesn't exist
ALTER TABLE team_registrations 
ADD COLUMN IF NOT EXISTS team_id TEXT UNIQUE;

-- 2. Add company and mentor columns if they don't exist
ALTER TABLE team_registrations 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS mentor_name TEXT,
ADD COLUMN IF NOT EXISTS mentor_email TEXT,
ADD COLUMN IF NOT EXISTS mentor_contact TEXT;

-- 3. Create index on team_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_registrations_team_id ON team_registrations(team_id);

-- 4. Add team_id and company_name to team_solutions if missing
ALTER TABLE team_solutions 
ADD COLUMN IF NOT EXISTS team_id TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 5. Create index on team_solutions team_id
CREATE INDEX IF NOT EXISTS idx_team_solutions_team_id ON team_solutions(team_id);

-- 6. Drop problematic foreign key constraint
-- This resolves: "violates foreign key constraint team_solutions_registration_id_fkey"
-- which happens when internal IDs differ between primary and secondary databases.
ALTER TABLE team_solutions 
DROP CONSTRAINT IF EXISTS team_solutions_registration_id_fkey;

-- 7. Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- 8. Verify the columns exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('team_registrations', 'team_solutions')
  AND column_name IN ('team_id', 'company_name', 'mentor_name', 'mentor_email', 'mentor_contact')
ORDER BY table_name, ordinal_position;
