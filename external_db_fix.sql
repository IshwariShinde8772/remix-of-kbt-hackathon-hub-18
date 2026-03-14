-- ============================================================
-- EXTERNAL DATABASE FIX
-- Run this in External Supabase SQL Editor
-- https://supabase.com/dashboard/project/lxawemydhhmqjahttrlb/sql
-- ============================================================

-- 1. Add team_id column if it doesn't exist
ALTER TABLE team_registrations 
ADD COLUMN IF NOT EXISTS team_id TEXT UNIQUE;

-- 2. Create index on team_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_registrations_team_id ON team_registrations(team_id);

-- 3. Add team_id to team_solutions if missing
ALTER TABLE team_solutions 
ADD COLUMN IF NOT EXISTS team_id TEXT;

-- 4. Create index on team_solutions team_id
CREATE INDEX IF NOT EXISTS idx_team_solutions_team_id ON team_solutions(team_id);

-- 5. Verify the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('team_registrations', 'team_solutions')
ORDER BY table_name, ordinal_position;
