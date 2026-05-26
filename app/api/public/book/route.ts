import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not configured' }, { status: 500 });
    }

    const body = await req.json();

    const {
      name,
      phone,
      email,
      checkin,
      checkout,
      guests,
      bookingType,
      rooms,
      payment,
      transactionId,
      eventDate,
      eventType,
      eventSlot,
      guestRange,
      foodPackage,
      decorationRequired,
      soundSystemRequired,
      totalEstimatedPrice,
      season_type,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // 1. Find or create customer
    let customerId = '';
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .limit(1)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: cErr } = await supabase
        .from('customers')
        .insert([{ full_name: name, phone, email: email || null }])
        .select('id')
        .single();
        
      if (cErr) throw cErr;
      customerId = newCustomer.id;
    }

    // 2. Prepare Booking Data
    const bookingCode = `BKG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Convert boolean options
    const isPadma = season_type === 'padma';
    const isDeco = decorationRequired === 'Yes';
    const isSound = soundSystemRequired === 'Yes';

    // Check for matching trip slot
    let tripSlotId = null;
    if (!isPadma && checkin) {
      const { data: slots } = await supabase
        .from('trip_slots')
        .select('id')
        .eq('start_date', checkin)
        .limit(1)
        .single();
      
      if (slots) {
        tripSlotId = slots.id;
      }
    }

    const bookingData = {
      booking_code: bookingCode,
      customer_id: customerId,
      season_type: season_type || 'haor',
      booking_type: isPadma ? 'full_boat' : (bookingType === 'full' ? 'full_boat' : 'cabin_wise'),
      check_in_date: isPadma ? eventDate : checkin,
      check_out_date: isPadma ? eventDate : checkout,
      number_of_guests: parseInt(guests || '1', 10),
      total_amount: totalEstimatedPrice || 0,
      advance_amount: 0,
      due_amount: totalEstimatedPrice || 0,
      payment_status: 'unpaid',
      booking_status: 'pending',
      special_request: `Selected Rooms: ${rooms}`,
      admin_note: null,
      event_type: isPadma ? eventType : null,
      event_slot: isPadma ? eventSlot : null,
      event_date: isPadma ? eventDate : null,
      food_package: isPadma ? foodPackage : null,
      decoration_required: isPadma ? isDeco : null,
      sound_system_required: isPadma ? isSound : null,
      payment_method: payment || null,
      transaction_id: transactionId || null,
      trip_slot_id: tripSlotId,
    };

    const { error: bErr } = await supabase.from('bookings').insert([bookingData]);

    if (bErr) throw bErr;

    return NextResponse.json({ success: true, bookingCode });

  } catch (error: any) {
    console.error('Booking submission error:', error);
    return NextResponse.json({ error: 'Failed to save booking', details: error.message }, { status: 500 });
  }
}
