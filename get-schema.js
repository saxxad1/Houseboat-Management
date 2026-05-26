const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_schema_info'); // if exists
  // Alternative: try to insert a string into capacity
  const { error: err2 } = await supabase.from('rooms').update({ capacity: '2-3' }).eq('id', 1);
  console.log(err2);
}
checkSchema();
