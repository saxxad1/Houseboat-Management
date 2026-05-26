-- Production readiness fixes for booking details, trip slots, and RLS hardening.

alter table public.rooms
  add column if not exists price_2_pax numeric,
  add column if not exists price_3_pax numeric;

update public.rooms set price_2_pax = price_per_night where price_2_pax is null;
update public.rooms set price_3_pax = price_per_night where price_3_pax is null;

alter table public.bookings
  add column if not exists room_details jsonb,
  add column if not exists transaction_id text;

create table if not exists public.trip_slots (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  duration_label text not null default '2 Days 1 Night',
  status availability_status not null default 'available',
  reason text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_trip_slot_dates check (end_date >= start_date)
);

alter table public.trip_slots enable row level security;

drop policy if exists "Public can read trip slots" on public.trip_slots;
drop policy if exists "Admins can manage trip slots" on public.trip_slots;

create policy "Public can read trip slots"
  on public.trip_slots for select
  using (true);

create policy "Admins can manage trip slots"
  on public.trip_slots for all
  using (public.is_admin())
  with check (public.is_admin());

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trip_slots_updated_at') then
    create trigger trip_slots_updated_at
      before update on public.trip_slots
      for each row execute function public.set_updated_at();
  end if;
end $$;

drop policy if exists "Admins can view all reviews." on public.reviews;
drop policy if exists "Admins can insert reviews." on public.reviews;
drop policy if exists "Admins can update reviews." on public.reviews;
drop policy if exists "Admins can delete reviews." on public.reviews;

create policy "Admins can view all reviews."
  on public.reviews for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert reviews."
  on public.reviews for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update reviews."
  on public.reviews for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete reviews."
  on public.reviews for delete
  to authenticated
  using (public.is_admin());

create or replace function public.prevent_double_booking()
returns trigger as $$
begin
  if new.booking_status in ('cancelled', 'completed') then
    return new;
  end if;

  if new.season_type = 'padma' then
    new.event_date = coalesce(new.event_date, new.check_in_date);

    if exists (
      select 1
      from public.bookings b
      where b.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and b.season_type = 'padma'
        and b.booking_status in ('pending', 'confirmed', 'checked_in')
        and coalesce(b.event_date, b.check_in_date) = coalesce(new.event_date, new.check_in_date)
        and (
          b.event_slot = new.event_slot
          or b.event_slot = 'full_day'
          or new.event_slot = 'full_day'
        )
    ) then
      raise exception 'Selected event slot is already booked';
    end if;
  else
    if exists (
      select 1
      from public.bookings b
      where b.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and coalesce(b.season_type, 'haor') = 'haor'
        and b.booking_status in ('pending', 'confirmed', 'checked_in')
        and daterange(b.check_in_date, b.check_out_date, '[)') && daterange(new.check_in_date, new.check_out_date, '[)')
        and (
          b.booking_type = 'full_boat'
          or new.booking_type = 'full_boat'
          or b.room_id = new.room_id
          or exists (
            select 1
            from jsonb_array_elements(coalesce(new.room_details, '[]'::jsonb)) nr
            where nr->>'roomId' = b.room_id::text
          )
          or exists (
            select 1
            from jsonb_array_elements(coalesce(b.room_details, '[]'::jsonb)) br
            where br->>'roomId' = new.room_id::text
          )
          or exists (
            select 1
            from jsonb_array_elements(coalesce(new.room_details, '[]'::jsonb)) nr
            join jsonb_array_elements(coalesce(b.room_details, '[]'::jsonb)) br
              on nr->>'roomId' = br->>'roomId'
          )
        )
    ) then
      raise exception 'Selected date/room is already booked';
    end if;
  end if;

  new.due_amount = greatest(new.total_amount - new.advance_amount, 0);
  if new.advance_amount <= 0 then
    new.payment_status = 'unpaid';
  elsif new.due_amount <= 0 then
    new.payment_status = 'paid';
  else
    new.payment_status = 'partially_paid';
  end if;

  return new;
end;
$$ language plpgsql;
