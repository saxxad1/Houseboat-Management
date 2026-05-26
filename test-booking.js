import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data: trip } = await supabase.from('trip_slots').select('*').limit(1).single();
  if (!trip) return console.log('No trip');
  
  const payload = {
    booking_code: 'TEST-123',
    customer_id: null,
    booking_type: 'cabin_wise',
    room_id: null,
    check_in_date: trip.start_date,
    check_out_date: trip.end_date,
    number_of_guests: 5,
    total_amount: 50000,
    advance_amount: 0,
    due_amount: 50000,
    payment_status: 'unpaid',
    booking_status: 'pending',
    trip_slot_id: trip.id
  };
  
  const { error } = await supabase.from('bookings').insert(payload);
  if (error) console.error('Error inserting booking:', error);
  else console.log('Booking inserted successfully');
}

test();
