require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data } = await supabase.from('website_content').select('*').eq('section_key', 'packages').single();
  console.log("DB Data:", data);
}

test();
