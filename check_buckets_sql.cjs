const { createClient } = require('@supabase/supabase-js');
const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3MDcwMywiZXhwIjoyMDg0NTQ2NzAzfQ.8lpW26X2YtAtvvImtcGP7Iw_tcwMPBVTBIygbCBYatM';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: `SELECT id, name, public FROM storage.buckets;`
  });
  
  if (error) {
    console.error('Error fetching buckets via SQL:', error);
    return;
  }
  
  console.log('Buckets (SQL):');
  console.table(data);
}
check();
