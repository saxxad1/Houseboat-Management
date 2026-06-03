import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { calculateBookingDiscount } from '@/lib/discounts';
import type { SpecialDate } from '@/types/database';

type SubmittedRoomDetail = {
  roomId?: string;
  roomName?: string;
  pax?: number;
  subtotal?: number;
};
type DbRoomPrice = {
  id: string;
  name: string;
  price_per_night?: number | null;
  price_2_pax?: number | null;
  price_3_pax?: number | null;
};

const activeBookingStatuses = ['pending', 'confirmed', 'checked_in'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const eventSlotAliases: Record<string, string> = {
  'Morning Slot': 'morning',
  'Afternoon Slot': 'afternoon',
  'Evening Slot': 'evening',
  'Moonlight Slot': 'moonlight',
  'Full Day Event': 'full_day',
  'Day Long Trip': 'full_day',
  'Private Full Boat': 'full_day',
  'Custom Group Trip': 'custom',
  'Custom Slot': 'custom',
};

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function normalizeEventSlot(value?: string) {
  if (!value) return '';
  return eventSlotAliases[value] || value;
}

function parseGuestCount(value: unknown, fallback = 1) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseGuestRange(value: unknown) {
  const matches = String(value || '').match(/\d+/g);
  if (!matches?.length) return 1;
  return parseGuestCount(matches[matches.length - 1], 1);
}

function normalizeRooms(value: unknown): SubmittedRoomDetail[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((room) => {
      const detail = room as SubmittedRoomDetail;
      return {
        roomId: String(detail.roomId || '').trim(),
        roomName: String(detail.roomName || '').trim(),
        pax: parseGuestCount(detail.pax, 1),
        subtotal: Number(detail.subtotal || 0),
      };
    })
    .filter((room) => room.roomId || room.roomName);
}

function getCabinPrice(room: { price_per_night?: number | null; price_2_pax?: number | null; price_3_pax?: number | null }, pax: number) {
  if (pax === 2 && room.price_2_pax) return Number(room.price_2_pax);
  if (pax === 3 && room.price_3_pax) return Number(room.price_3_pax);
  return Number(room.price_per_night || 0);
}

function getFullBoatPrice(guests: number, acPreference: unknown) {
  const isAC = String(acPreference || 'AC') === 'AC';
  const prices: Record<number, { ac: number; nonAc: number }> = {
    16: { ac: 180000, nonAc: 150000 },
    18: { ac: 200000, nonAc: 165000 },
    20: { ac: 215000, nonAc: 180000 },
    22: { ac: 230000, nonAc: 195000 },
    25: { ac: 250000, nonAc: 210000 },
  };
  const matched = prices[guests];
  if (!matched) return null;
  return isAC ? matched.ac : matched.nonAc;
}

function normalizeRoomName(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function isMissingColumnError(error: unknown) {
  const message = String((error as { message?: string })?.message || '').toLowerCase();
  return message.includes('schema cache') || message.includes('column') || message.includes('could not find');
}

async function insertBookingWithFallback(supabase: any, bookingData: Record<string, unknown>) {
  const optionalSchemaKeys = [
    'trip_slot_id',
    'room_details',
    'subtotal_amount',
    'discount_amount',
    'discount_reason',
    'transaction_id',
    'season_type',
    'event_type',
    'event_slot',
    'event_date',
    'food_package',
    'decoration_required',
    'sound_system_required',
    'payment_method',
  ];
  const fallbackData = { ...bookingData };
  const removedKeys = new Set<string>();
  let lastResult = null as any;

  for (let attempt = 0; attempt <= optionalSchemaKeys.length; attempt += 1) {
    lastResult = await supabase.from('bookings').insert([fallbackData]);
    if (!lastResult.error) return lastResult;

    if (!isMissingColumnError(lastResult.error)) {
      return lastResult;
    }

    const message = String(lastResult.error.message || '').toLowerCase();
    const missingKey = optionalSchemaKeys.find((key) => !removedKeys.has(key) && message.includes(key));

    if (missingKey) {
      delete fallbackData[missingKey];
      removedKeys.add(missingKey);
      continue;
    }

    const nextKey = optionalSchemaKeys.find((key) => !removedKeys.has(key));
    if (!nextKey) return lastResult;
    delete fallbackData[nextKey];
    removedKeys.add(nextKey);
  }

  return lastResult;
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient() as any;
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
      acPreference,
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
      season_type,
      request,
      roomDetails,
      paymentMode,
      payableAmount,
      botField,
    } = body;

    if (botField) {
      return NextResponse.json({ success: true });
    }

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const isPadma = season_type === 'padma';
    const selectedRooms = isPadma ? [] : normalizeRooms(roomDetails);
    const normalizedEventSlot = isPadma ? normalizeEventSlot(eventSlot || 'full_day') : normalizeEventSlot(eventSlot);
    const normalizedEventType = isPadma ? String(eventType || 'Padma Day Long Trip') : eventType;
    const checkInDate = isPadma ? eventDate : checkin;
    const checkOutDate = isPadma && eventDate ? addDays(eventDate, 1) : checkout;

    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Valid booking dates are required' }, { status: 400 });
    }

    if (isPadma && !eventDate) {
      return NextResponse.json({ error: 'Trip date is required' }, { status: 400 });
    }

    if (!isPadma && bookingType !== 'full' && selectedRooms.length === 0) {
      return NextResponse.json({ error: 'Select at least one valid cabin' }, { status: 400 });
    }

    const validRoomIds = selectedRooms
      .map((room) => String(room.roomId || '').trim())
      .filter((roomId) => UUID_REGEX.test(roomId));
    const dbRooms = selectedRooms.length
      ? validRoomIds.length === selectedRooms.length
        ? await supabase
            .from('rooms')
            .select('id, name, price_per_night, price_2_pax, price_3_pax')
            .in('id', validRoomIds)
            .eq('status', 'active')
        : await supabase
            .from('rooms')
            .select('id, name, price_per_night, price_2_pax, price_3_pax')
            .eq('status', 'active')
      : { data: [], error: null };

    if (dbRooms.error) throw dbRooms.error;

    const roomRows = (dbRooms.data || []) as DbRoomPrice[];
    const roomsById = new Map<string, DbRoomPrice>(roomRows.map((room: DbRoomPrice) => [room.id, room]));
    const roomsByName = new Map<string, DbRoomPrice>(roomRows.map((room: DbRoomPrice) => [normalizeRoomName(room.name), room]));
    const resolvedRoomDetails = selectedRooms.map((room) => {
      const roomId = String(room.roomId || '').trim();
      return UUID_REGEX.test(roomId) && roomsById.has(roomId)
        ? { ...room, roomId }
        : {
            ...room,
            roomId: roomsByName.get(normalizeRoomName(room.roomName))?.id || roomId,
          };
    });

    if (!isPadma && bookingType !== 'full' && resolvedRoomDetails.some((room) => !UUID_REGEX.test(String(room.roomId || '')))) {
      return NextResponse.json({ error: 'One or more selected cabins are unavailable' }, { status: 400 });
    }

    if (!isPadma && bookingType !== 'full' && resolvedRoomDetails.length !== selectedRooms.length) {
      return NextResponse.json({ error: 'One or more selected cabins are unavailable' }, { status: 400 });
    }

    const normalizedRoomDetails = resolvedRoomDetails.map((room) => {
      const roomId = String(room.roomId || '');
      const pax = Number(room.pax || 1);
      return {
        roomId,
        roomName: roomsById.get(roomId)?.name || room.roomName,
        pax,
        subtotal: getCabinPrice(roomsById.get(roomId) || {}, pax) * pax,
      };
    });
    const firstRoomId = normalizedRoomDetails[0]?.roomId || null;
    const bookingMode = isPadma ? 'full_boat' : (bookingType === 'full' ? 'full_boat' : 'cabin_wise');

    if (isPadma) {
      const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id, event_slot')
        .eq('season_type', 'padma')
        .eq('event_date', eventDate)
        .in('booking_status', activeBookingStatuses);

      if (conflictError) throw conflictError;
      const hasConflict = (conflicts || []).some((booking: { event_slot: string | null }) => (
        booking.event_slot === normalizedEventSlot ||
        booking.event_slot === 'full_day' ||
        normalizedEventSlot === 'full_day'
      ));
      if (hasConflict) {
        return NextResponse.json({ error: 'Selected event slot is already booked' }, { status: 409 });
      }
    } else {
      const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id, booking_type, room_id, room_details')
        .eq('season_type', 'haor')
        .lt('check_in_date', checkOutDate)
        .gt('check_out_date', checkInDate)
        .in('booking_status', activeBookingStatuses);

      if (conflictError) throw conflictError;
      const selectedRoomIds = new Set(normalizedRoomDetails.map((room) => room.roomId));
      const hasConflict = (conflicts || []).some((booking: { booking_type: string; room_id: string | null; room_details?: SubmittedRoomDetail[] | null }) => {
        if (bookingMode === 'full_boat' || booking.booking_type === 'full_boat') return true;
        if (booking.room_id && selectedRoomIds.has(booking.room_id)) return true;
        return Array.isArray(booking.room_details) && booking.room_details.some((room) => room.roomId && selectedRoomIds.has(room.roomId));
      });

      if (hasConflict) {
        return NextResponse.json({ error: 'Selected date or cabin is already booked' }, { status: 409 });
      }
    }

    // 1. Find or create customer
    let customerId = '';
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

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
        .maybeSingle();
      
      if (slots) {
        tripSlotId = slots.id;
      }
    }

    const guestCount = isPadma
      ? parseGuestCount(guests, parseGuestRange(guestRange))
      : bookingMode === 'cabin_wise'
        ? normalizedRoomDetails.reduce((sum, room) => sum + Number(room.pax || 0), 0)
        : parseGuestCount(guests, 1);

    let padmaPricePerPerson = 0;
    if (isPadma) {
      const { data: settings, error: settingsError } = await supabase
        .from('houseboat_settings')
        .select('padma_price_per_person')
        .limit(1)
        .maybeSingle();

      if (settingsError) throw settingsError;
      padmaPricePerPerson = Math.max(Math.round(Number(settings?.padma_price_per_person || 0)), 0);
    }

    const subtotalAmount = isPadma
      ? padmaPricePerPerson * guestCount
      : bookingMode === 'cabin_wise'
        ? normalizedRoomDetails.reduce((sum, room) => sum + Number(room.subtotal || 0), 0)
        : getFullBoatPrice(guestCount, acPreference);

    if (!isPadma && subtotalAmount === null) {
      return NextResponse.json({ error: 'Invalid full boat guest count' }, { status: 400 });
    }

    const { data: specialDates } = await supabase
      .from('special_dates')
      .select('date, title, date_type, is_discount_excluded, is_active')
      .eq('is_active', true);
    const pricing = isPadma
      ? {
          subtotalAmount: Number(subtotalAmount || 0),
          discountAmount: 0,
          totalAmount: Number(subtotalAmount || 0),
          discountPercent: 0,
          discountReason: null,
          isDiscountApplied: false,
        }
      : calculateBookingDiscount(
          Number(subtotalAmount || 0),
          checkInDate,
          (specialDates || []) as SpecialDate[]
        );
    const requestedPayableAmount = Math.max(Math.round(Number(payableAmount || 0)), 0);
    const calculatedPayableAmount = paymentMode === 'full' ? pricing.totalAmount : Math.ceil(pricing.totalAmount / 2);
    const confirmedAdvanceAmount = transactionId
      ? Math.min(requestedPayableAmount || calculatedPayableAmount, pricing.totalAmount)
      : 0;
    const specialRequest = [
      rooms ? `Selected Rooms: ${rooms}` : '',
      isPadma && padmaPricePerPerson ? `Padma Price/Person: ৳${padmaPricePerPerson.toLocaleString()}` : '',
      guestRange && isPadma ? `Guest Range: ${guestRange}` : '',
      !isPadma && pricing.discountAmount ? `Discount: ${pricing.discountReason} (-৳${pricing.discountAmount.toLocaleString()})` : '',
      paymentMode ? `Payment Mode: ${paymentMode === 'full' ? 'Full Payment' : '50% Advance'}` : '',
      request ? `Request: ${request}` : '',
    ].filter(Boolean).join('\n') || null;

    const bookingData = {
      booking_code: bookingCode,
      customer_id: customerId,
      season_type: season_type || 'haor',
      booking_type: bookingMode,
      room_id: bookingMode === 'cabin_wise' ? firstRoomId : null,
      room_details: bookingMode === 'cabin_wise' ? normalizedRoomDetails : null,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      number_of_guests: guestCount,
      subtotal_amount: pricing.subtotalAmount,
      discount_amount: pricing.discountAmount,
      discount_reason: pricing.discountReason,
      total_amount: pricing.totalAmount,
      advance_amount: confirmedAdvanceAmount,
      due_amount: Math.max(pricing.totalAmount - confirmedAdvanceAmount, 0),
      payment_status: confirmedAdvanceAmount >= pricing.totalAmount && pricing.totalAmount > 0 ? 'paid' : confirmedAdvanceAmount > 0 ? 'partially_paid' : 'unpaid',
      booking_status: 'pending',
      special_request: specialRequest,
      admin_note: null,
      event_type: isPadma ? normalizedEventType : null,
      event_slot: isPadma ? normalizedEventSlot : null,
      event_date: isPadma ? eventDate : null,
      food_package: isPadma ? null : foodPackage || null,
      decoration_required: isPadma ? false : isDeco,
      sound_system_required: isPadma ? false : isSound,
      payment_method: payment || null,
      transaction_id: transactionId || null,
      trip_slot_id: tripSlotId,
    };

    const { error: bErr } = await insertBookingWithFallback(supabase, bookingData);

    if (bErr) throw bErr;

    return NextResponse.json({ success: true, bookingCode });

  } catch (error: any) {
    console.error('Booking submission error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save booking' }, { status: 500 });
  }
}
