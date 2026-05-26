import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase URL or Key' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Add Customers
    const customersData = Array.from({ length: 15 }).map((_, i) => ({
      full_name: `Customer ${Math.random().toString(36).substring(7)}`,
      phone: `+880170000000${Math.floor(Math.random() * 9)}`,
      email: `customer${Math.random().toString(36).substring(7)}@example.com`,
      address: 'Dhaka, Bangladesh'
    }));
    const { data: customers, error: cErr } = await supabase.from('customers').insert(customersData).select();
    if (cErr) throw cErr;

    // 2. Add Rooms
    const randomSuffix = Math.random().toString(36).substring(7);
    const roomsData = [
      { name: `Luxury Cabin 1 ${randomSuffix}`, slug: `luxury-cabin-1-${randomSuffix}`, capacity: 2, price_per_night: 5000, description: 'Premium room', status: 'active' },
      { name: `Luxury Cabin 2 ${randomSuffix}`, slug: `luxury-cabin-2-${randomSuffix}`, capacity: 2, price_per_night: 5000, description: 'Premium room', status: 'active' },
      { name: `Family Suite ${randomSuffix}`, slug: `family-suite-${randomSuffix}`, capacity: 4, price_per_night: 8000, description: 'Large room', status: 'active' }
    ];
    const { data: rooms, error: rErr } = await supabase.from('rooms').insert(roomsData).select();
    if (rErr) throw rErr;

    // 3. Add Packages
    const packagesData = [
      { title: `Haor Explorer ${randomSuffix}`, slug: `haor-explorer-${randomSuffix}`, description: 'Explore Tanguar Haor', price: 15000, status: 'active', max_guests: 6 },
      { title: `Padma Sunset ${randomSuffix}`, slug: `padma-sunset-${randomSuffix}`, description: 'Afternoon cruise', price: 5000, status: 'active', max_guests: 10 }
    ];
    const { data: packages, error: pErr } = await supabase.from('packages').insert(packagesData).select();
    if (pErr) throw pErr;

    // 4. Add Bookings (Distribute over last 3 months and next 1 month)
    const bookingsData = [];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'partial', 'paid'];
    
    for (let i = 0; i < 40; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const pkg = packages[Math.floor(Math.random() * packages.length)];
      const isPadma = Math.random() > 0.7;
      const dateOffset = Math.floor(Math.random() * 120) - 90; // -90 to +30 days
      const date = new Date();
      date.setDate(date.getDate() + dateOffset);
      const dateStr = date.toISOString().split('T')[0];
      
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 2);
      const endDateStr = endDate.toISOString().split('T')[0];

      const total = isPadma ? 5000 : 15000;
      const paid = Math.random() > 0.5 ? total : (Math.random() > 0.5 ? total / 2 : 0);

      let bookingStatus = statuses[Math.floor(Math.random() * statuses.length)];
      let payStatus = 'unpaid';
      if (paid === total) payStatus = 'paid';
      else if (paid > 0) payStatus = 'partially_paid';

      bookingsData.push({
        booking_code: `BKG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        customer_id: customer.id,
        season_type: isPadma ? 'padma' : 'haor',
        booking_type: isPadma ? 'full_boat' : 'cabin_wise',
        room_id: !isPadma ? room.id : null,
        package_id: pkg.id,
        event_date: isPadma ? dateStr : null,
        event_slot: isPadma ? 'afternoon' : null,
        check_in_date: dateStr,
        check_out_date: endDateStr,
        number_of_guests: Math.floor(Math.random() * 4) + 1,
        total_amount: total,
        advance_amount: paid,
        due_amount: total - paid,
        payment_status: payStatus,
        booking_status: bookingStatus
      });
    }
    const { error: bErr } = await supabase.from('bookings').insert(bookingsData);
    if (bErr) throw bErr;

    // 5. Add Income and Expenses for last 6 months
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 0; i < 90; i++) {
      const dateOffset = Math.floor(Math.random() * 180) * -1; // Last 180 days
      const date = new Date();
      date.setDate(date.getDate() + dateOffset);
      const dateStr = date.toISOString().split('T')[0];

      incomeData.push({
        title: 'Dummy Income',
        amount: Math.floor(Math.random() * 15000) + 5000,
        income_date: dateStr,
        category: ['booking', 'food', 'extra_guest', 'bbq'][Math.floor(Math.random() * 4)],
        note: 'Dummy income'
      });

      expenseData.push({
        title: 'Dummy Expense',
        amount: Math.floor(Math.random() * 10000) + 2000,
        expense_date: dateStr,
        category: ['fuel', 'food', 'maintenance', 'staff_salary'][Math.floor(Math.random() * 4)],
        note: 'Dummy expense'
      });
    }

    const { error: iErr } = await supabase.from('income').insert(incomeData);
    if (iErr) throw iErr;

    const { error: eErr } = await supabase.from('expenses').insert(expenseData);
    if (eErr) throw eErr;

    // 6. Reviews
    const reviewsData = Array.from({ length: 6 }).map((_, i) => ({
      name: `Reviewer ${i + 1}`,
      location: 'Dhaka',
      rating: 5,
      review: 'Awesome experience!',
      avatar: 'R',
      is_published: true
    }));
    await supabase.from('reviews').insert(reviewsData);

    return NextResponse.json({ success: true, message: 'Dummy data seeded successfully!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error seeding data' }, { status: 500 });
  }
}
