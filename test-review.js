require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('reviews').insert([{
    name: 'Test',
    location: 'Dhaka',
    rating: 5,
    review: 'Awesome',
    avatar: 'TS',
    is_published: true
  }]);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
