require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const [settings, rooms, packages, gallery, content, availability, trip_slots, special_dates, reviews] = await Promise.all([
    supabase.from('houseboat_settings').select('*').limit(1).maybeSingle(),
    supabase.from('rooms').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('packages').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('gallery').select('*').order('sort_order'),
    supabase.from('website_content').select('id, section_key').limit(1),
    supabase.from('availability_blocks').select('*').limit(1),
    supabase.from('trip_slots').select('*').limit(1),
    supabase.from('special_dates').select('id').limit(1),
    supabase.from('reviews').select('id').limit(1),
  ]);
  const errs = {
    settings: settings.error, rooms: rooms.error, packages: packages.error, gallery: gallery.error,
    content: content.error, availability: availability.error, trip_slots: trip_slots.error,
    special_dates: special_dates.error, reviews: reviews.error
  };
  console.log(JSON.stringify(errs, null, 2));
}
run();
