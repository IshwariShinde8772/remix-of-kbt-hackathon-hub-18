const { createClient } = require('@supabase/supabase-js');
const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzA3MDMsImV4cCI6MjA4NDU0NjcwM30.HrbyMWysiWGBzt47cBERKZ-PGgRXpyBNYMM8xP2w1lk';
const supabase = createClient(url, key);

async function check() {
  const { data } = await supabase.from('team_registrations').select('*').limit(1);
  if (data) {
    console.log('Keys present in row:', Object.keys(data[0]));
    if (data[0].problem_statement_title) {
      console.log('Title found:', data[0].problem_statement_title);
    } else {
      console.log('Title NOT found in row data.');
    }
  }
}
check();
