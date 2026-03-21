import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from("team_registrations")
    .select("problem_statement_id")
    .gte("created_at", "2026-03-18T00:00:00Z");
  
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
