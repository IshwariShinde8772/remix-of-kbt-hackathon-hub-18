const { createClient } = require('@supabase/supabase-js');
const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3MDcwMywiZXhwIjoyMDg0NTQ2NzAzfQ.8lpW26X2YtAtvvImtcGP7Iw_tcwMPBVTBIygbCBYatM';
const supabase = createClient(url, key);

async function check() {
  const content = Buffer.from('test file content');
  const { data, error } = await supabase.storage.from('registration-forms').upload('test_check.txt', content, {
    contentType: 'text/plain',
    upsert: true
  });
  
  if (error) {
    console.error('Error uploading test file:', error);
    return;
  }
  
  console.log('Successfully uploaded test file:', data);
  
  const { data: { publicUrl } } = supabase.storage.from('registration-forms').getPublicUrl('test_check.txt');
  console.log('Public URL:', publicUrl);
}
check();
