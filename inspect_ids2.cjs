const { createClient } = require('@supabase/supabase-js');

const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzA3MDMsImV4cCI6MjA4NDU0NjcwM30.HrbyMWysiWGBzt47cBERKZ-PGgRXpyBNYMM8xP2w1lk';
const supabase = createClient(url, key);

async function inspectIds() {
  const { data, error } = await supabase.from('team_registrations').select('problem_statement_id, problem_statement_uuid').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log('ID:', data[0].problem_statement_id);
    console.log('UUID:', data[0].problem_statement_uuid);
  }
}

inspectIds();
