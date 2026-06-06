import type { Booking, TripSlot } from '@/types/database';

export type ManualTripBooking = {
  id?: string;
  customer_name?: string;
  phone?: string;
  number_of_guests?: number;
  total_amount?: number;
  roomId?: string;
  roomName?: string;
  roomDetails?: { roomId?: string; roomName?: string }[];
};

export type ManualTripExpense = {
  id?: string;
  title?: string;
  category?: string;
  amount?: number;
  expense_date?: string;
  vendor_name?: string;
  note?: string;
};

export type ManualTripData = {
  manualBookings: ManualTripBooking[];
  manualExpenses: ManualTripExpense[];
};

export const activeBookingStatuses = ['pending', 'confirmed', 'checked_in'];

export function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && startB < endA;
}

function nextDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

function tripSlotRangeOverlaps(checkInDate: string, checkOutDate: string, tripStartDate: string, tripEndDate: string) {
  const normalizedTripEndDate = tripEndDate > tripStartDate ? tripEndDate : nextDate(tripEndDate);
  return rangesOverlap(checkInDate, checkOutDate, tripStartDate, normalizedTripEndDate);
}

export function parseManualTripData(note?: string | null): ManualTripData {
  if (!note) {
    return { manualBookings: [], manualExpenses: [] };
  }

  try {
    const parsed = JSON.parse(note);
    return {
      manualBookings: Array.isArray(parsed.manualBookings) ? parsed.manualBookings : [],
      manualExpenses: Array.isArray(parsed.manualExpenses) ? parsed.manualExpenses : [],
    };
  } catch {
    return { manualBookings: [], manualExpenses: [] };
  }
}

export function getBookingRoomIds(booking: Partial<Booking>) {
  const roomIds = new Set<string>();
  if (booking.room_id) {
    roomIds.add(booking.room_id);
  }

  let details = booking.room_details;
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (e) {
      // Ignore parse error
    }
  }

  if (Array.isArray(details)) {
    details.forEach((detail) => {
      if (detail?.roomId) {
        roomIds.add(detail.roomId);
      }
    });
  }

  return roomIds;
}

export function getManualBookingRoomIds(booking: ManualTripBooking) {
  const roomIds = new Set<string>();
  if (booking.roomId) {
    roomIds.add(booking.roomId);
  }
  
  let details = booking.roomDetails;
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (e) {
      // Ignore parse error
    }
  }

  if (Array.isArray(details)) {
    details.forEach((detail) => {
      if (detail?.roomId) {
        roomIds.add(detail.roomId);
      }
    });
  }
  return roomIds;
}

export function getBookedRoomIdsForRange(
  bookings: Partial<Booking>[],
  tripSlots: Pick<TripSlot, 'id' | 'start_date' | 'end_date' | 'note'>[],
  checkInDate: string,
  checkOutDate: string,
  options: { excludeBookingId?: string; excludeManualBookingId?: string } = {}
) {
  const roomIds = new Set<string>();

  bookings.forEach((booking) => {
    if (booking.id === options.excludeBookingId) return;
    if ((booking.season_type || 'haor') !== 'haor') return;
    if (!activeBookingStatuses.includes(String(booking.booking_status))) return;
    if (!booking.check_in_date || !booking.check_out_date) return;
    if (!rangesOverlap(checkInDate, checkOutDate, booking.check_in_date, booking.check_out_date)) return;

    getBookingRoomIds(booking).forEach((roomId) => roomIds.add(roomId));
  });

  tripSlots.forEach((trip) => {
    if (!tripSlotRangeOverlaps(checkInDate, checkOutDate, trip.start_date, trip.end_date)) return;
    const manualData = parseManualTripData(trip.note);
    manualData.manualBookings.forEach((booking) => {
      if (booking.id === options.excludeManualBookingId) return;
      getManualBookingRoomIds(booking).forEach((roomId) => roomIds.add(roomId));
    });
  });

  return roomIds;
}

export function hasFullBoatBookingForRange(
  bookings: Partial<Booking>[],
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: string
) {
  return bookings.some((booking) => {
    if (booking.id === excludeBookingId) return false;
    if ((booking.season_type || 'haor') !== 'haor') return false;
    if (booking.booking_type !== 'full_boat') return false;
    if (!activeBookingStatuses.includes(String(booking.booking_status))) return false;
    if (!booking.check_in_date || !booking.check_out_date) return false;
    return rangesOverlap(checkInDate, checkOutDate, booking.check_in_date, booking.check_out_date);
  });
}

export function hasManualTripBookingForRange(
  tripSlots: Pick<TripSlot, 'id' | 'start_date' | 'end_date' | 'note'>[],
  checkInDate: string,
  checkOutDate: string,
  excludeManualBookingId?: string
) {
  return tripSlots.some((trip) => {
    if (!tripSlotRangeOverlaps(checkInDate, checkOutDate, trip.start_date, trip.end_date)) return false;
    const manualData = parseManualTripData(trip.note);
    return manualData.manualBookings.some((booking) => booking.id !== excludeManualBookingId);
  });
}

export function hasManualTripRoomConflict(
  roomIds: Iterable<string>,
  tripSlots: Pick<TripSlot, 'id' | 'start_date' | 'end_date' | 'note'>[],
  checkInDate: string,
  checkOutDate: string,
  excludeManualBookingId?: string
) {
  const selectedRoomIds = new Set(Array.from(roomIds).filter(Boolean));
  if (!selectedRoomIds.size) return false;

  const bookedRoomIds = getBookedRoomIdsForRange([], tripSlots, checkInDate, checkOutDate, { excludeManualBookingId });
  return Array.from(selectedRoomIds).some((roomId) => bookedRoomIds.has(roomId));
}
