const fs = require('fs');
fetch('http://localhost:3000/api/public/data')
  .then(res => res.json())
  .then(data => {
    const bookings = data.bookings;
    const rooms = data.rooms;
    const tripSlots = data.trip_slots;
    console.log("Total bookings fetched:", bookings.length);
    console.log("First booking details:", JSON.stringify(bookings[0], null, 2));

    const checkInDate = '2026-07-20';
    const checkOutDate = '2026-07-21';

    let size = 0;
    bookings.forEach(booking => {
      let overlaps = (checkInDate < booking.check_out_date && booking.check_in_date < checkOutDate);
      console.log(`Booking ${booking.id} (${booking.check_in_date} to ${booking.check_out_date}): overlaps? ${overlaps}, status: ${booking.booking_status}, season: ${booking.season_type}`);
      if (overlaps && booking.booking_status === 'pending' || booking.booking_status === 'confirmed') size++;
    });
    console.log("Matching bookings for July 20-21:", size);
  });
