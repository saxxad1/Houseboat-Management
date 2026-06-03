const fetch = require('node-fetch');

async function run() {
  const res = await fetch('http://localhost:3000/api/public/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Test",
      phone: "01736627899",
      checkin: "2026-07-09",
      checkout: "2026-07-10",
      guests: "3",
      bookingType: "cabin",
      roomDetails: [{ roomId: "51c548a3-2cba-4df3-82a8-fce4e0c39f0d", roomName: "Manaslu AC Cabin", pax: 3, subtotal: 10000 }],
      paymentMode: "full",
      season_type: "haor"
    })
  });
  console.log(res.status);
  const text = await res.text();
  console.log(text);
}
run();
