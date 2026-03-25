-- This SQL script creates a trigger to automatically maintain the selected_by_count
-- in the problem_statements table whenever a new team registers.

-- 1. Create the function that increments the count
CREATE OR REPLACE FUNCTION increment_selected_by_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment the count for the newly linked problem statement
  IF NEW.problem_statement_id IS NOT NULL THEN
    UPDATE public.problem_statements
    SET selected_by_count = COALESCE(selected_by_count, 0) + 1
    WHERE id = NEW.problem_statement_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the team_registrations table
-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS tr_increment_selected_by_count ON public.team_registrations;

CREATE TRIGGER tr_increment_selected_by_count
AFTER INSERT ON public.team_registrations
FOR EACH ROW
EXECUTE FUNCTION increment_selected_by_count();

-- 3. (Optional) Create a function for decrementing on delete if needed
CREATE OR REPLACE FUNCTION decrement_selected_by_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.problem_statement_id IS NOT NULL THEN
    UPDATE public.problem_statements
    SET selected_by_count = GREATEST(0, COALESCE(selected_by_count, 0) - 1)
    WHERE id = OLD.problem_statement_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_decrement_selected_by_count ON public.team_registrations;

CREATE TRIGGER tr_decrement_selected_by_count
AFTER DELETE ON public.team_registrations
FOR EACH ROW
EXECUTE FUNCTION decrement_selected_by_count();

-- 4. RPC Fallback (for the Edge Function to call if needed)
CREATE OR REPLACE FUNCTION increment_problem_count(prob_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.problem_statements
  SET selected_by_count = COALESCE(selected_by_count, 0) + 1
  WHERE id = prob_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
