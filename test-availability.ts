import { getBookedRoomIdsForRange } from './lib/bookingAvailability';

async function main() {
  const data = await fetch('http://localhost:3000/api/public/data').then(res => res.json());
  const bookings = data.bookings;
  const tripSlots = data.trip_slots;

  const roomIds = getBookedRoomIdsForRange(bookings, tripSlots, '2026-07-20', '2026-07-21');
  console.log('Booked room IDs:', Array.from(roomIds));
}
main();
