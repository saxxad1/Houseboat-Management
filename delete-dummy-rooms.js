require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Find dummy rooms (they have random suffixes or names like 'Luxury Cabin 1 %')
  const { data: rooms, error } = await supabase.from('rooms').select('id, name');
  if (error) { console.error('Error fetching rooms:', error); return; }

  const originalRoomNames = [
    'রাজহাঁস কেবিন', 'পদ্মা কেবিন', 'মেঘনা কেবিন', 'সুরমা কেবিন', 'হাওর ফ্যামিলি স্যুট', 'বর্ষা ডিলাক্স'
  ];

  const dummyRooms = rooms.filter(r => !originalRoomNames.includes(r.name));
  
  if (dummyRooms.length === 0) {
    console.log('No dummy rooms found.');
    return;
  }

  const dummyRoomIds = dummyRooms.map(r => r.id);
  console.log(`Found ${dummyRoomIds.length} dummy rooms.`);

  // Find bookings for these rooms
  const { data: bookings, error: bError } = await supabase.from('bookings').select('id').in('room_id', dummyRoomIds);
  if (bError) { console.error('Error fetching bookings:', bError); return; }

  if (bookings.length > 0) {
    const bookingIds = bookings.map(b => b.id);
    console.log(`Deleting ${bookingIds.length} dummy bookings...`);
    const { error: delBError } = await supabase.from('bookings').delete().in('id', bookingIds);
    if (delBError) { console.error('Error deleting bookings:', delBError); return; }
  }

  console.log(`Deleting ${dummyRoomIds.length} dummy rooms...`);
  const { error: delRError } = await supabase.from('rooms').delete().in('id', dummyRoomIds);
  if (delRError) { console.error('Error deleting rooms:', delRError); return; }

  console.log('Successfully deleted all dummy rooms and their bookings!');
}

run();
