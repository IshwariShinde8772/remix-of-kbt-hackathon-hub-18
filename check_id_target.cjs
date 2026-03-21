const { createClient } = require('@supabase/supabase-js');
const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzA3MDMsImV4cCI6MjA4NDU0NjcwM30.HrbyMWysiWGBzt47cBERKZ-PGgRXpyBNYMM8xP2w1lk';
const supabase = createClient(url, key);

async function check() {
  const { data: results } = await supabase.from('problem_statements').select('id, problem_title');
  const target = 'ab10f4c9-a556-4ab1-a809-4b1cd53dd5ea';
  const found = results.find(p => p.id === target);
  console.log('Target ID Found:', found ? 'YES' : 'NO');
  if (found) {
    console.log('Details:', found);
  }
}
check();
