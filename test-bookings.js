require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('bookings').select('id, check_in_date, room_details').eq('check_in_date', '2026-07-09');
  console.log(JSON.stringify(data, null, 2));
}
run();
