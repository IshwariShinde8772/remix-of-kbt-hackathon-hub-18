const { createClient } = require('@supabase/supabase-js');
const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3MDcwMywiZXhwIjoyMDg0NTQ2NzAzfQ.8lpW26X2YtAtvvImtcGP7Iw_tcwMPBVTBIygbCBYatM';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('team_registrations').select('*').limit(1);
  if (error) {
    console.error('Table access failed:', error);
  } else {
    console.log('Table access SUCCESSful');
  }

  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error('Bucket list failed:', bError);
  } else {
    console.log('Buckets list:', buckets);
  }
}
check();
