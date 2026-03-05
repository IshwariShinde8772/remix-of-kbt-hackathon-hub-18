
-- ==========================================================
-- Run this SQL in External Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lxawemydhhmqjahttrlb/sql
--
-- NOTE: Storage bucket policies for 'solutions' bucket must be
-- set via the Supabase Storage UI (not SQL editor).
-- ==========================================================

-- 1. Add solution_pdf_url column to team_solutions (safe)
ALTER TABLE team_solutions 
ADD COLUMN IF NOT EXISTS solution_pdf_url TEXT;

-- 2. Allow anon to insert into team_solutions
DROP POLICY IF EXISTS "Allow anon insert into team_solutions" ON team_solutions;
CREATE POLICY "Allow anon insert into team_solutions"
ON team_solutions
FOR INSERT
TO anon
WITH CHECK (true);

-- 3. Allow anon to search/read team_registrations
DROP POLICY IF EXISTS "Allow anon read team_registrations" ON team_registrations;
CREATE POLICY "Allow anon read team_registrations"
ON team_registrations
FOR SELECT
TO anon
USING (true);

