-- This SQL script updates the trigger to cast problem_statement_id to uuid

-- 1. Create the function that increments the count
CREATE OR REPLACE FUNCTION increment_selected_by_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment the count for the newly linked problem statement
  IF NEW.problem_statement_id IS NOT NULL AND NEW.problem_statement_id != '' THEN
    UPDATE public.problem_statements
    SET selected_by_count = COALESCE(selected_by_count, 0) + 1
    WHERE id = NEW.problem_statement_id::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Optional) Create a function for decrementing on delete if needed
CREATE OR REPLACE FUNCTION decrement_selected_by_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.problem_statement_id IS NOT NULL AND OLD.problem_statement_id != '' THEN
    UPDATE public.problem_statements
    SET selected_by_count = GREATEST(0, COALESCE(selected_by_count, 0) - 1)
    WHERE id = OLD.problem_statement_id::uuid;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
