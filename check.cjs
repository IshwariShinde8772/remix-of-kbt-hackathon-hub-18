const { createClient } = require('@supabase/supabase-js');
const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzA3MDMsImV4cCI6MjA4NDU0NjcwM30.HrbyMWysiWGBzt47cBERKZ-PGgRXpyBNYMM8xP2w1lk';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from('team_registrations')
    .select('problem_statement_id')
    .gte('created_at', '2026-03-18T00:00:00Z');
  console.log('Error:', error);
  console.log('Data:', data);
  console.log('Length:', data ? data.length : 0);
}
check();
