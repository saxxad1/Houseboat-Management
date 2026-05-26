import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding dummy data...');

  // 1. Add Customers
  const customersData = Array.from({ length: 5 }).map((_, i) => ({
    full_name: `Customer ${i + 1}`,
    phone: `+880170000000${i}`,
    email: `customer${i + 1}@example.com`,
    address: 'Dhaka, Bangladesh'
  }));
  const { data: customers, error: cErr } = await supabase.from('customers').insert(customersData).select();
  if (cErr) console.error('Customers Error:', cErr.message);

  // 2. Add Rooms
  const roomsData = [
    { name: 'Luxury Cabin 1', capacity: 2, price_per_night: 5000, description: 'Premium room with lake view', is_available: true },
    { name: 'Luxury Cabin 2', capacity: 2, price_per_night: 5000, description: 'Premium room with lake view', is_available: true },
    { name: 'Family Suite', capacity: 4, price_per_night: 8000, description: 'Large room for family', is_available: true }
  ];
  const { data: rooms, error: rErr } = await supabase.from('rooms').insert(roomsData).select();
  if (rErr) console.error('Rooms Error:', rErr.message);

  // 3. Add Packages
  const packagesData = [
    { title: 'Haor Explorer 2N/3D', description: 'Explore Tanguar Haor for 2 nights', price: 15000, is_active: true },
    { title: 'Padma Sunset Cruise', description: 'Afternoon cruise on Padma', price: 5000, is_active: true }
  ];
  const { data: packages, error: pErr } = await supabase.from('tour_packages').insert(packagesData).select();
  if (pErr) console.error('Packages Error:', pErr.message);

  if (!customers || !rooms || !packages) return;

  // 4. Add Bookings (Distribute over last 3 months and next 1 month)
  const bookingsData = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const paymentStatuses = ['pending', 'partial', 'paid'];
  
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    const isPadma = Math.random() > 0.7;
    const dateOffset = Math.floor(Math.random() * 120) - 90; // -90 to +30 days
    const date = new Date();
    date.setDate(date.getDate() + dateOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 2);
    const endDateStr = endDate.toISOString().split('T')[0];

    const total = isPadma ? 5000 : 15000;
    const paid = Math.random() > 0.5 ? total : total / 2;

    bookingsData.push({
      booking_code: `BKG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      customer_id: customer.id,
      season_type: isPadma ? 'padma' : 'haor',
      booking_type: isPadma ? 'event' : 'cabin',
      room_id: !isPadma ? room.id : null,
      event_date: isPadma ? dateStr : null,
      event_slot: isPadma ? 'Afternoon' : null,
      check_in_date: !isPadma ? dateStr : null,
      check_out_date: !isPadma ? endDateStr : null,
      number_of_guests: Math.floor(Math.random() * 4) + 1,
      total_amount: total,
      paid_amount: paid,
      due_amount: total - paid,
      payment_status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      booking_status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: 'Dummy booking for UI testing'
    });
  }
  const { error: bErr } = await supabase.from('bookings').insert(bookingsData);
  if (bErr) console.error('Bookings Error:', bErr.message);

  // 5. Add Income and Expenses for last 6 months
  const incomeData = [];
  const expenseData = [];
  
  for (let i = 0; i < 60; i++) {
    const dateOffset = Math.floor(Math.random() * 180) * -1; // Last 180 days
    const date = new Date();
    date.setDate(date.getDate() + dateOffset);
    const dateStr = date.toISOString().split('T')[0];

    incomeData.push({
      amount: Math.floor(Math.random() * 15000) + 5000,
      income_date: dateStr,
      source: ['Room Booking', 'Food', 'Event', 'Tips'][Math.floor(Math.random() * 4)],
      description: 'Dummy income'
    });

    expenseData.push({
      amount: Math.floor(Math.random() * 10000) + 2000,
      expense_date: dateStr,
      category: ['Fuel', 'Food & Groceries', 'Maintenance', 'Staff Salary'][Math.floor(Math.random() * 4)],
      description: 'Dummy expense'
    });
  }

  const { error: iErr } = await supabase.from('income').insert(incomeData);
  if (iErr) console.error('Income Error:', iErr.message);

  const { error: eErr } = await supabase.from('expenses').insert(expenseData);
  if (eErr) console.error('Expense Error:', eErr.message);

  console.log('Dummy data seeded successfully!');
}

seed().catch(console.error);
