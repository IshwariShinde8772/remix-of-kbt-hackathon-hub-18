const { createClient } = require('@supabase/supabase-js');

const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3MDcwMywiZXhwIjoyMDg0NTQ2NzAzfQ.8lpW26X2YtAtvvImtcGP7Iw_tcwMPBVTBIygbCBYatM';
const supabase = createClient(url, key);

async function checkSchema() {
  const { data: columns, error } = await supabase.rpc('execute_sql', {
    sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'team_registrations';"
  });
  
  if (error) {
    console.error('Error fetching schema:', error.message);
    // Fallback if execute_sql doesn't exist
    const { data: sample } = await supabase.from('team_registrations').select('*').limit(1);
    console.log('Sample Data Structure:', Object.keys(sample[0] || {}).join(', '));
  } else {
    console.log('Schema:', JSON.stringify(columns, null, 2));
  }
}

checkSchema();
