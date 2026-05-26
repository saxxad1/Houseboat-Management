import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone || phone.trim() === '') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Sanitize phone (e.g., remove spaces or country codes if necessary, or just exact match)
    const sanitizedPhone = phone.trim();

    // 1. Find the customer(s) by phone
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, full_name')
      .eq('phone', sanitizedPhone);

    if (customerError) {
      console.error('Error fetching customers:', customerError);
      return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
    }

    if (!customers || customers.length === 0) {
      // Return empty array if customer not found
      return NextResponse.json({ bookings: [] });
    }

    const customerIds = (customers || []).map((c: any) => c.id);

    // 2. Fetch bookings for these customer IDs
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_code,
        check_in_date,
        check_out_date,
        number_of_guests,
        booking_status,
        payment_status,
        total_amount,
        advance_amount,
        due_amount,
        booking_type,
        created_at
      `)
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    // Grouping by customer is not necessary since we return an array of bookings
    // We can also attach the customer name to each booking for display
    const enrichedBookings = (bookings || []).map((b: any) => {
      // Though all bookings match the phone, finding exact customer name isn't strictly needed for the response 
      // since the user knows their own name, but it's nice to have.
      return {
        ...b,
      };
    });

    return NextResponse.json({ bookings: enrichedBookings });

  } catch (error) {
    console.error('API Error in my-bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
