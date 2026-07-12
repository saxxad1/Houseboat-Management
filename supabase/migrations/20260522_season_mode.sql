-- Season mode support for Floatbase.
-- Adds Haor / Padma mode, Padma event booking fields, and slot-based availability fields.

alter table public.houseboat_settings
  add column if not exists active_season text not null default 'haor',
  add column if not exists season_updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'houseboat_settings_active_season_check'
  ) then
    alter table public.houseboat_settings
      add constraint houseboat_settings_active_season_check
      check (active_season in ('haor', 'padma'));
  end if;
end $$;

alter table public.rooms
  add column if not exists season_type text not null default 'haor',
  add column if not exists display_mode text not null default 'cabin';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'rooms_season_type_check') then
    alter table public.rooms
      add constraint rooms_season_type_check check (season_type in ('haor', 'padma'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'rooms_display_mode_check') then
    alter table public.rooms
      add constraint rooms_display_mode_check check (display_mode in ('cabin', 'event_space'));
  end if;
end $$;

alter table public.packages
  add column if not exists season_type text not null default 'haor',
  add column if not exists suggested_time text,
  add column if not exists best_for text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'packages_season_type_check') then
    alter table public.packages
      add constraint packages_season_type_check check (season_type in ('haor', 'padma'));
  end if;
end $$;

alter table public.bookings
  add column if not exists season_type text not null default 'haor',
  add column if not exists event_type text,
  add column if not exists event_slot text,
  add column if not exists event_date date,
  add column if not exists event_start_time time,
  add column if not exists event_end_time time,
  add column if not exists food_package text,
  add column if not exists decoration_required boolean not null default false,
  add column if not exists sound_system_required boolean not null default false,
  add column if not exists payment_method payment_method;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_season_type_check') then
    alter table public.bookings
      add constraint bookings_season_type_check check (season_type in ('haor', 'padma'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_event_slot_check') then
    alter table public.bookings
      add constraint bookings_event_slot_check
      check (event_slot is null or event_slot in ('morning', 'afternoon', 'evening', 'moonlight', 'full_day', 'custom'));
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'cabin_booking_requires_room') then
    alter table public.bookings drop constraint cabin_booking_requires_room;
  end if;
  alter table public.bookings
    add constraint cabin_booking_requires_room check (
      season_type = 'padma'
      or booking_type = 'full_boat'
      or room_id is not null
    );
end $$;

alter table public.availability_blocks
  add column if not exists season_type text not null default 'haor',
  add column if not exists event_slot text,
  add column if not exists slot_status text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'availability_blocks_season_type_check') then
    alter table public.availability_blocks
      add constraint availability_blocks_season_type_check check (season_type in ('haor', 'padma'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'availability_blocks_event_slot_check') then
    alter table public.availability_blocks
      add constraint availability_blocks_event_slot_check
      check (event_slot is null or event_slot in ('morning', 'afternoon', 'evening', 'moonlight', 'full_day', 'custom'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'availability_blocks_slot_status_check') then
    alter table public.availability_blocks
      add constraint availability_blocks_slot_status_check
      check (slot_status is null or slot_status in ('available', 'inquiry_pending', 'booked', 'blocked', 'maintenance'));
  end if;
end $$;

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
