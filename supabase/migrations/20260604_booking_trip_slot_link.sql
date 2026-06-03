-- Link public bookings to scheduled Haor trip slots.

alter table public.bookings
  add column if not exists trip_slot_id uuid references public.trip_slots(id) on delete set null;
