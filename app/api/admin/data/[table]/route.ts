import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminContext, isAdminTableName, requireWritableAdmin } from '@/lib/admin/serverAuth';
import {
  activeBookingStatuses,
  getBookedRoomIdsForRange,
  getBookingRoomIds,
  getManualBookingRoomIds,
  hasFullBoatBookingForRange,
  hasManualTripBookingForRange,
  hasManualTripRoomConflict,
  parseManualTripData,
  rangesOverlap,
} from '@/lib/bookingAvailability';
import type { AdminRow } from '@/lib/admin/data';
import type { AdminTableName, Booking, TripSlot } from '@/types/database';

type RouteContext = {
  params: Promise<{ table: string }>;
};

function withTimestamps(row: Partial<AdminRow> & { id?: string }) {
  const timestamp = new Date().toISOString();
  return {
    ...row,
    updated_at: timestamp,
    created_at: row.created_at || timestamp,
  };
}

async function getTable(context: RouteContext) {
  const { table } = await context.params;
  return table;
}

function requireOwnerAdmin(table: string, role?: string) {
  if (table === 'admin_profiles' && role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can manage admin profiles' }, { status: 403 });
  }

  return null;
}

function hasBookingConflict(candidate: Partial<Booking>, bookings: Partial<Booking>[], tripSlots: TripSlot[]) {
  if (!activeBookingStatuses.includes(String(candidate.booking_status))) return false;

  if ((candidate.season_type || 'haor') === 'padma') {
    if (!candidate.event_date || !candidate.event_slot) return false;
    return bookings.some((booking) => {
      if (booking.id === candidate.id) return false;
      if ((booking.season_type || 'haor') !== 'padma') return false;
      if (!activeBookingStatuses.includes(String(booking.booking_status))) return false;
      if ((booking.event_date || booking.check_in_date) !== candidate.event_date) return false;
      return booking.event_slot === candidate.event_slot || booking.event_slot === 'full_day' || candidate.event_slot === 'full_day';
    });
  }

  if (!candidate.check_in_date || !candidate.check_out_date) return false;

  const candidateRoomIds = getBookingRoomIds(candidate);
  const bookingConflict = bookings.some((booking) => {
    if (booking.id === candidate.id) return false;
    if ((booking.season_type || 'haor') !== 'haor') return false;
    if (!activeBookingStatuses.includes(String(booking.booking_status))) return false;
    if (!booking.check_in_date || !booking.check_out_date) return false;
    if (!rangesOverlap(candidate.check_in_date!, candidate.check_out_date!, booking.check_in_date, booking.check_out_date)) {
      return false;
    }
    if (candidate.booking_type === 'full_boat' || booking.booking_type === 'full_boat') return true;

    const bookedRoomIds = getBookingRoomIds(booking);
    return Array.from(candidateRoomIds).some((roomId) => bookedRoomIds.has(roomId));
  });

  if (bookingConflict) return true;

  return candidate.booking_type === 'full_boat'
    ? hasManualTripBookingForRange(tripSlots, candidate.check_in_date, candidate.check_out_date)
    : hasManualTripRoomConflict(candidateRoomIds, tripSlots, candidate.check_in_date, candidate.check_out_date);
}

async function validateBookingSave(db: any, row: Partial<Booking>) {
  if (!activeBookingStatuses.includes(String(row.booking_status))) return null;

  const [{ data: bookings, error: bookingsError }, { data: tripSlots, error: tripSlotsError }] = await Promise.all([
    db
      .from('bookings')
      .select('id, booking_type, room_id, room_details, check_in_date, check_out_date, booking_status, season_type, event_date, event_slot'),
    db
      .from('trip_slots')
      .select('id, start_date, end_date, note'),
  ]);

  if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 400 });
  if (tripSlotsError) return NextResponse.json({ error: tripSlotsError.message }, { status: 400 });

  if (hasBookingConflict(row, bookings || [], tripSlots || [])) {
    return NextResponse.json({ error: 'Selected room/full boat is already booked on this date.' }, { status: 409 });
  }

  return null;
}

async function validateTripSlotSave(db: any, row: Partial<TripSlot>) {
  if (!row.note) return null;

  const currentTrip = row.id
    ? await db
        .from('trip_slots')
        .select('id, start_date, end_date, note')
        .eq('id', row.id)
        .maybeSingle()
    : { data: null, error: null };

  if (currentTrip.error) {
    return NextResponse.json({ error: currentTrip.error.message }, { status: 400 });
  }

  const startDate = row.start_date || currentTrip.data?.start_date;
  const endDate = row.end_date || currentTrip.data?.end_date;
  if (!startDate || !endDate) return null;

  const manualBookings = parseManualTripData(row.note).manualBookings;
  if (!manualBookings.length) return null;

  const selectedRoomIds = manualBookings.flatMap((booking) => Array.from(getManualBookingRoomIds(booking)));
  if (new Set(selectedRoomIds).size !== selectedRoomIds.length) {
    return NextResponse.json({ error: 'A room can only be selected once for this trip.' }, { status: 409 });
  }

  const [{ data: bookings, error: bookingsError }, { data: tripSlots, error: tripSlotsError }] = await Promise.all([
    db
      .from('bookings')
      .select('id, booking_type, room_id, room_details, check_in_date, check_out_date, booking_status, season_type'),
    db
      .from('trip_slots')
      .select('id, start_date, end_date, note'),
  ]);

  if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 400 });
  if (tripSlotsError) return NextResponse.json({ error: tripSlotsError.message }, { status: 400 });

  if (hasFullBoatBookingForRange(bookings || [], startDate, endDate)) {
    return NextResponse.json({ error: 'Full boat is already booked for this trip date.' }, { status: 409 });
  }

  const otherTripSlots = (tripSlots || []).filter((trip: TripSlot) => trip.id !== row.id);
  const bookedRoomIds = getBookedRoomIdsForRange(bookings || [], otherTripSlots, startDate, endDate);
  const conflictedRoomId = selectedRoomIds.find((roomId) => bookedRoomIds.has(roomId));
  if (conflictedRoomId) {
    return NextResponse.json({ error: 'Selected room is already booked for this trip date.' }, { status: 409 });
  }

  return null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  const table = await getTable(context);
  if (!isAdminTableName(table)) {
    return NextResponse.json({ error: 'Invalid admin table' }, { status: 400 });
  }

  const db = admin.supabase as any;
  const { data, error } = await db.from(table).select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ rows: data || [] });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  const table = await getTable(context);
  if (!isAdminTableName(table)) {
    return NextResponse.json({ error: 'Invalid admin table' }, { status: 400 });
  }
  const writeError = requireWritableAdmin(admin.profile?.role, table as AdminTableName);
  if (writeError) return writeError;
  const roleError = requireOwnerAdmin(table, admin.profile?.role);
  if (roleError) return roleError;

  const body = await request.json().catch(() => ({}));
  const row = (body.row || {}) as Partial<AdminRow> & { id?: string };
  const payload = withTimestamps(row);
  const db = admin.supabase as any;

  if (table === 'bookings') {
    const conflictError = await validateBookingSave(db, payload as Partial<Booking>);
    if (conflictError) return conflictError;
  }

  if (table === 'trip_slots') {
    const conflictError = await validateTripSlotSave(db, payload as Partial<TripSlot>);
    if (conflictError) return conflictError;
  }

  if (table === 'houseboat_settings' && !row.id) {
    const { data: existing, error: existingError } = await db
      .from('houseboat_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 });
    }

    if (existing?.id) {
      payload.id = existing.id;
    }
  }

  if (payload.id) {
    const { id, ...updatePayload } = payload;
    const { data, error } = await db
      .from(table)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ row: data });
  }

  const { id: _id, ...insertPayload } = payload;
  const { data, error } = await db
    .from(table)
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ row: data });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  const table = await getTable(context);
  if (!isAdminTableName(table)) {
    return NextResponse.json({ error: 'Invalid admin table' }, { status: 400 });
  }
  const writeError = requireWritableAdmin(admin.profile?.role, table as AdminTableName);
  if (writeError) return writeError;
  const roleError = requireOwnerAdmin(table, admin.profile?.role);
  if (roleError) return roleError;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing row id' }, { status: 400 });
  }

  const db = admin.supabase as any;
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
