const { createClient } = require('@supabase/supabase-js');

const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzA3MDMsImV4cCI6MjA4NDU0NjcwM30.HrbyMWysiWGBzt47cBERKZ-PGgRXpyBNYMM8xP2w1lk';
const supabase = createClient(url, key);

async function checkCols() {
  const { data: cols, error } = await supabase.from('team_registrations').select('*').limit(1);
  if (error) console.error(error);
  else {
      for (const k in cols[0]) {
          console.log(`Column ${k}: value = ${cols[0][k]}, type = ${typeof cols[0][k]}`);
      }
  }
}

checkCols();
