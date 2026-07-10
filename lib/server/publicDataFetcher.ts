import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { replaceLegacyBrandText } from '@/lib/branding';

type ManualTripBooking = {
  id?: string;
  roomId?: string;
  roomName?: string;
  roomDetails?: { roomId?: string; roomName?: string; pax?: number }[];
};

type PublicBookingRow = {
  id: string;
  booking_type?: string | null;
  room_id?: string | null;
  room_details?: { roomId?: string; roomName?: string; pax?: number; subtotal?: number }[] | null;
  special_request?: string | null;
  [key: string]: unknown;
};

function getManualBookingRooms(booking: ManualTripBooking) {
  const rooms = new Map<string, { roomId: string; roomName?: string; pax?: number }>();
  if (booking.roomId) {
    rooms.set(booking.roomId, {
      roomId: booking.roomId,
      roomName: booking.roomName,
    });
  }
  if (Array.isArray(booking.roomDetails)) {
    booking.roomDetails.forEach((room) => {
      if (room?.roomId) {
        rooms.set(room.roomId, {
          roomId: room.roomId,
          roomName: room.roomName,
          pax: room.pax,
        });
      }
    });
  }
  return Array.from(rooms.values());
}

function getManualTripBookingRows(tripSlots: any[]) {
  return tripSlots.flatMap((trip) => {
    if (!trip?.note) return [];

    try {
      const parsed = JSON.parse(trip.note);
      const manualBookings = Array.isArray(parsed.manualBookings) ? parsed.manualBookings as ManualTripBooking[] : [];
      return manualBookings.flatMap((booking, bookingIndex) => {
        const rooms = getManualBookingRooms(booking);
        if (!rooms.length) return [];
        return [{
          id: `manual-${trip.id}-${booking.id || bookingIndex}`,
          booking_type: 'cabin_wise',
          room_id: rooms[0].roomId,
          room_details: rooms.map((room) => ({
            roomId: room.roomId,
            roomName: room.roomName,
            pax: room.pax || 1,
            subtotal: 0,
          })),
          check_in_date: trip.start_date,
          check_out_date: trip.end_date > trip.start_date ? trip.end_date : nextDate(trip.end_date),
          booking_status: 'pending',
          season_type: 'haor',
          event_date: null,
          event_slot: null,
          trip_slot_id: trip.id,
        }];
      });
    } catch {
      return [];
    }
  });
}

function nextDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

function normalizeText(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function replaceLegacyBrandInValue<T>(value: T): T {
  if (typeof value === 'string') {
    return replaceLegacyBrandText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceLegacyBrandInValue(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, replaceLegacyBrandInValue(item)])
    ) as T;
  }

  return value;
}

function hydrateBookingRoomsFromRequest(bookings: PublicBookingRow[], rooms: { id: string; name: string }[]) {
  const roomsByName = new Map(rooms.map((room) => [normalizeText(room.name), room]));

  return bookings.map((booking) => {
    if (booking.booking_type === 'full_boat' || booking.room_id || (Array.isArray(booking.room_details) && booking.room_details.length)) {
      return booking;
    }

    const selectedRoomsLine = String(booking.special_request || '')
      .split('\n')
      .find((line) => line.toLowerCase().startsWith('selected rooms:'));
    if (!selectedRoomsLine) return booking;

    const roomDetails = selectedRoomsLine
      .replace(/^selected rooms:\s*/i, '')
      .split(',')
      .map((item) => item.replace(/\([^)]*\)/g, '').trim())
      .map((roomName) => roomsByName.get(normalizeText(roomName)))
      .filter((room): room is { id: string; name: string } => Boolean(room))
      .map((room) => ({
        roomId: room.id,
        roomName: room.name,
        pax: 1,
        subtotal: 0,
      }));

    return roomDetails.length
      ? { ...booking, room_id: roomDetails[0].roomId, room_details: roomDetails }
      : booking;
  });
}

export async function fetchPublicHouseboatData() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return null;
  }

  const [settings, rooms, gallery, content, availability, trip_slots, special_dates, reviews, bookings] = await Promise.all([
    supabase
      .from('houseboat_settings')
      .select('id, houseboat_name, tagline, description, phone, whatsapp, email, facebook_url, location, address, bkash_number, nagad_number, bank_info, padma_price_per_person, promo_discount_percent, promo_discount_start_date, promo_discount_end_date, promo_discount_title, primary_color, secondary_color, logo_url, active_season, season_updated_at, created_at, updated_at')
      .limit(1)
      .maybeSingle(),
    supabase.from('rooms').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('gallery').select('*').order('sort_order'),
    supabase.from('website_content').select('id, section_key, title, subtitle, content, image_url, button_text, button_url, is_active, created_at, updated_at'),
    supabase.from('availability_blocks').select('*'),
    supabase.from('trip_slots').select('id, start_date, end_date, duration_label, status, reason, note, created_at, updated_at'),
    supabase
      .from('special_dates')
      .select('id, date, title, date_type, is_discount_excluded, is_active, note, created_at, updated_at')
      .eq('is_active', true)
      .order('date'),
    supabase.from('reviews').select('id, name, location, rating, review, avatar, is_published, source, source_url, external_created_at, is_featured, created_at, updated_at').eq('is_published', true).order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('id, booking_type, room_id, room_details, check_in_date, check_out_date, booking_status, season_type, event_date, event_slot, trip_slot_id, special_request')
      .in('booking_status', ['pending', 'confirmed', 'checked_in']),
  ]);

  const error = settings.error || rooms.error || gallery.error || content.error || availability.error || trip_slots.error || reviews.error || bookings.error;
  if (error) {
    return null;
  }

  const tripSlotRows = trip_slots.data || [];
  const bookingRows = hydrateBookingRoomsFromRequest((bookings.data || []) as PublicBookingRow[], (rooms.data || []) as { id: string; name: string }[]);
  const manualTripBookingRows = getManualTripBookingRows(tripSlotRows);

  return replaceLegacyBrandInValue({
    settings: settings.data,
    rooms: rooms.data || [],
    gallery: gallery.data || [],
    content: content.data || [],
    availability: availability.data || [],
    trip_slots: tripSlotRows,
    special_dates: special_dates.error ? [] : special_dates.data || [],
    reviews: reviews.data || [],
    bookings: [...bookingRows, ...manualTripBookingRows],
  });
}
