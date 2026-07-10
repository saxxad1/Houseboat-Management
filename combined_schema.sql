-- File: initial_schema.sql
-- FloatBoat / single-houseboat admin schema
-- Run this in Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

create type room_status as enum ('active', 'inactive', 'maintenance');
create type package_status as enum ('active', 'inactive');
create type booking_type as enum ('full_boat', 'cabin_wise');
create type booking_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled');
create type payment_status as enum ('unpaid', 'partially_paid', 'paid', 'refunded');
create type payment_method as enum ('cash', 'bkash', 'nagad', 'bank', 'other');
create type income_category as enum ('booking', 'food', 'extra_guest', 'bbq', 'transport', 'service', 'other');
create type expense_category as enum ('food', 'staff_salary', 'fuel', 'maintenance', 'cleaning', 'transport', 'marketing', 'commission', 'utility', 'other');
create type availability_status as enum ('available', 'partially_booked', 'fully_booked', 'blocked', 'maintenance');

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role in ('admin', 'manager')
  );
end;
$$ language plpgsql security definer set search_path = public;

create table public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin', 'manager')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.houseboat_settings (
  id uuid primary key default gen_random_uuid(),
  houseboat_name text not null,
  tagline text,
  description text,
  phone text,
  whatsapp text,
  email text,
  facebook_url text,
  location text,
  address text,
  bkash_number text,
  nagad_number text,
  bank_info text,
  primary_color text default '#075985',
  secondary_color text default '#f59e0b',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  bed_type text,
  capacity integer not null default 2 check (capacity > 0),
  price_per_night numeric(12,2) not null default 0 check (price_per_night >= 0),
  has_attached_washroom boolean not null default false,
  has_ac boolean not null default false,
  facilities jsonb not null default '[]'::jsonb,
  status room_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  duration text,
  price numeric(12,2) not null default 0 check (price >= 0),
  max_guests integer not null default 1 check (max_guests > 0),
  included_services jsonb not null default '[]'::jsonb,
  meal_info text,
  route_spots jsonb not null default '[]'::jsonb,
  image_url text,
  status package_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  address text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  booking_type booking_type not null default 'cabin_wise',
  room_id uuid references public.rooms(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  check_in_date date not null,
  check_out_date date not null,
  number_of_guests integer not null default 1 check (number_of_guests > 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  advance_amount numeric(12,2) not null default 0 check (advance_amount >= 0),
  due_amount numeric(12,2) not null default 0 check (due_amount >= 0),
  payment_status payment_status not null default 'unpaid',
  booking_status booking_status not null default 'pending',
  special_request text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_booking_dates check (check_out_date > check_in_date),
  constraint valid_booking_amounts check (advance_amount <= total_amount),
  constraint cabin_booking_requires_room check (
    booking_type = 'full_boat' or room_id is not null
  )
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  payment_method payment_method not null default 'cash',
  transaction_id text,
  payment_date date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.income (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  title text not null,
  category income_category not null default 'booking',
  amount numeric(12,2) not null check (amount >= 0),
  income_date date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category expense_category not null default 'other',
  amount numeric(12,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  vendor_name text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  room_id uuid references public.rooms(id) on delete cascade,
  status availability_status not null default 'blocked',
  reason text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(date, room_id)
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  category text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.website_content (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  subtitle text,
  content text,
  image_url text,
  button_text text,
  button_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.prevent_double_booking()
returns trigger as $$
begin
  if new.booking_status in ('cancelled', 'completed') then
    return new;
  end if;

  if exists (
    select 1
    from public.bookings b
    where b.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
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

create trigger prevent_double_booking_trigger
before insert or update on public.bookings
for each row execute function public.prevent_double_booking();

create or replace function public.sync_booking_payment_totals()
returns trigger as $$
declare
  target_booking uuid;
  paid_total numeric(12,2);
  booking_total numeric(12,2);
begin
  target_booking = coalesce(new.booking_id, old.booking_id);
  select coalesce(sum(amount), 0) into paid_total from public.payments where booking_id = target_booking;
  select total_amount into booking_total from public.bookings where id = target_booking;

  update public.bookings
  set
    advance_amount = paid_total,
    due_amount = greatest(booking_total - paid_total, 0),
    payment_status = case
      when paid_total <= 0 then 'unpaid'::payment_status
      when paid_total >= booking_total then 'paid'::payment_status
      else 'partially_paid'::payment_status
    end,
    updated_at = now()
  where id = target_booking;

  if tg_op = 'INSERT' then
    insert into public.income (booking_id, title, category, amount, income_date, note)
    values (new.booking_id, 'Booking payment', 'booking', new.amount, new.payment_date, new.note);
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger sync_booking_payment_totals_trigger
after insert or update or delete on public.payments
for each row execute function public.sync_booking_payment_totals();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'admin_profiles',
    'houseboat_settings',
    'rooms',
    'packages',
    'customers',
    'bookings',
    'payments',
    'income',
    'expenses',
    'availability_blocks',
    'gallery',
    'website_content'
  ]
  loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- Public website read access for content tables.
create policy "Public can read settings" on public.houseboat_settings for select using (true);
create policy "Public can read active rooms" on public.rooms for select using (status = 'active');
create policy "Public can read active packages" on public.packages for select using (status = 'active');
create policy "Public can read gallery" on public.gallery for select using (true);
create policy "Public can read active website content" on public.website_content for select using (is_active = true);
create policy "Public can read availability blocks" on public.availability_blocks for select using (true);

-- Admin access.
create policy "Admins can manage admin profiles" on public.admin_profiles for all using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid());
create policy "Admins can manage settings" on public.houseboat_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage rooms" on public.rooms for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage packages" on public.packages for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage customers" on public.customers for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage bookings" on public.bookings for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage income" on public.income for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage expenses" on public.expenses for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage availability" on public.availability_blocks for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage gallery" on public.gallery for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage website content" on public.website_content for all using (public.is_admin()) with check (public.is_admin());

insert into public.houseboat_settings (
  houseboat_name,
  tagline,
  description,
  phone,
  whatsapp,
  email,
  facebook_url,
  location,
  address,
  logo_url
) values (
  'FloatBoat',
  'An Aesthetic Water Villa',
  'টাঙ্গুয়ার হাওরের বুকে এক নান্দনিক হাউসবোট অভিজ্ঞতা।',
  '+880 1700-000000',
  '8801700000000',
  'info@example.com',
  'https://facebook.com',
  'টাঙ্গুয়ার হাওর, সুনামগঞ্জ',
  'তাহিরপুর ঘাট, সুনামগঞ্জ',
  '/logo-floatboat.svg'
) on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('houseboat-media', 'houseboat-media', true)
on conflict (id) do nothing;

create policy "Public can view houseboat media" on storage.objects
for select using (bucket_id = 'houseboat-media');

create policy "Admins can upload houseboat media" on storage.objects
for insert with check (bucket_id = 'houseboat-media' and public.is_admin());

create policy "Admins can update houseboat media" on storage.objects
for update using (bucket_id = 'houseboat-media' and public.is_admin()) with check (bucket_id = 'houseboat-media' and public.is_admin());

create policy "Admins can delete houseboat media" on storage.objects
for delete using (bucket_id = 'houseboat-media' and public.is_admin());


-- File: 20260522_season_mode.sql
-- Season mode support for FloatBoat.
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


-- File: 20260523_create_reviews.sql
create table if not exists public.reviews (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    location text,
    rating integer not null check (rating >= 1 and rating <= 5),
    review text not null,
    avatar text not null,
    is_published boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
drop policy if exists "Public published reviews are viewable by everyone." on public.reviews;
drop policy if exists "Admins can view all reviews." on public.reviews;
drop policy if exists "Admins can insert reviews." on public.reviews;
drop policy if exists "Admins can update reviews." on public.reviews;
drop policy if exists "Admins can delete reviews." on public.reviews;

create policy "Public published reviews are viewable by everyone."
    on public.reviews for select
    using ( is_published = true );

create policy "Admins can view all reviews."
    on public.reviews for select
    to authenticated
    using ( public.is_admin() );

create policy "Admins can insert reviews."
    on public.reviews for insert
    to authenticated
    with check ( public.is_admin() );

create policy "Admins can update reviews."
    on public.reviews for update
    to authenticated
    using ( public.is_admin() )
    with check ( public.is_admin() );

create policy "Admins can delete reviews."
    on public.reviews for delete
    to authenticated
    using ( public.is_admin() );

-- Create trigger for updated_at
drop trigger if exists handle_updated_at on public.reviews;
drop trigger if exists reviews_updated_at on public.reviews;

create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();


-- File: 20260527_discount_controls.sql
alter table public.bookings
  add column if not exists subtotal_amount numeric(12,2),
  add column if not exists discount_amount numeric(12,2) not null default 0,
  add column if not exists discount_reason text;

update public.bookings
set subtotal_amount = coalesce(subtotal_amount, total_amount),
    discount_amount = coalesce(discount_amount, 0)
where subtotal_amount is null;

create table if not exists public.special_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  title text not null,
  date_type text not null default 'public_holiday',
  is_discount_excluded boolean not null default true,
  is_active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint special_dates_date_type_check check (date_type in ('public_holiday', 'full_moon', 'custom_no_discount', 'other'))
);

alter table public.special_dates enable row level security;

drop policy if exists "Anyone can read active special dates" on public.special_dates;
drop policy if exists "Admins can manage special dates" on public.special_dates;

create policy "Anyone can read active special dates"
on public.special_dates
for select
using (is_active = true);

create policy "Admins can manage special dates"
on public.special_dates
for all
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists set_special_dates_updated_at on public.special_dates;
create trigger set_special_dates_updated_at
before update on public.special_dates
for each row
execute function public.set_updated_at();


-- File: 20260527_production_readiness.sql
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


-- File: 20260528_padma_pricing.sql
-- Padma Day Long per-person pricing.

alter table public.houseboat_settings
  add column if not exists padma_price_per_person numeric(12,2) not null default 0;



-- File: 20260604_admin_viewer_role.sql
-- Add read-only admin viewer role.

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role in ('admin', 'manager', 'viewer'));

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role in ('admin', 'manager')
  );
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_admin_viewer()
returns boolean as $$
begin
  return exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role in ('admin', 'manager', 'viewer')
  );
end;
$$ language plpgsql security definer set search_path = public;


-- File: 20260604_booking_trip_slot_link.sql
-- Link public bookings to scheduled Haor trip slots.

alter table public.bookings
  add column if not exists trip_slot_id uuid references public.trip_slots(id) on delete set null;


-- File: 20260604_facebook_reviews.sql
-- Facebook review import metadata.

alter table public.reviews
  add column if not exists source text not null default 'manual',
  add column if not exists external_id text,
  add column if not exists source_url text,
  add column if not exists external_created_at timestamptz,
  add column if not exists is_featured boolean not null default false;

create unique index if not exists reviews_source_external_id_unique
  on public.reviews (source, external_id)
  where external_id is not null;


-- File: 20260606_promo_discount.sql
-- Add promotional discount columns to houseboat_settings table

ALTER TABLE public.houseboat_settings
ADD COLUMN promo_discount_percent integer DEFAULT 0,
ADD COLUMN promo_discount_start_date date,
ADD COLUMN promo_discount_end_date date,
ADD COLUMN promo_discount_title text;


-- File: 20260606_room_booking_conflicts.sql
-- Keep room availability consistent across public bookings, admin bookings,
-- and manual bookings stored on trip slots.

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

create or replace function public.trip_slot_manual_booking_room_ids(note_text text)
returns table(room_id text) as $$
declare
  manual_data jsonb;
begin
  if note_text is null or btrim(note_text) = '' then
    return;
  end if;

  begin
    manual_data := note_text::jsonb;
  exception when others then
    return;
  end;

  if jsonb_typeof(manual_data->'manualBookings') <> 'array' then
    return;
  end if;

  return query
    select booking.item->>'roomId'
    from jsonb_array_elements(manual_data->'manualBookings') as booking(item)
    where coalesce(booking.item->>'roomId', '') <> ''
    union all
    select detail.item->>'roomId'
    from jsonb_array_elements(manual_data->'manualBookings') as booking(item)
    cross join lateral jsonb_array_elements(coalesce(booking.item->'roomDetails', '[]'::jsonb)) as detail(item)
    where coalesce(detail.item->>'roomId', '') <> '';
end;
$$ language plpgsql stable;

create or replace function public.prevent_trip_slot_manual_room_conflicts()
returns trigger as $$
declare
  manual_data jsonb;
begin
  if new.note is null or btrim(new.note) = '' then
    return new;
  end if;

  begin
    manual_data := new.note::jsonb;
  exception when others then
    return new;
  end;

  if jsonb_typeof(manual_data->'manualBookings') <> 'array' then
    return new;
  end if;

  if exists (
    with manual_rooms as (
      select booking_idx, room_id
      from jsonb_array_elements(manual_data->'manualBookings') with ordinality booking(item, booking_idx)
      cross join lateral (
        select booking.item->>'roomId' as room_id
        where coalesce(booking.item->>'roomId', '') <> ''
        union
        select detail.item->>'roomId' as room_id
        from jsonb_array_elements(coalesce(booking.item->'roomDetails', '[]'::jsonb)) as detail(item)
        where coalesce(detail.item->>'roomId', '') <> ''
      ) rooms
    )
    select 1
    from manual_rooms
    group by room_id
    having count(*) > 1
  ) then
    raise exception 'A room can only be selected once for this trip';
  end if;

  if exists (
    select 1
    from public.bookings b
    where coalesce(b.season_type, 'haor') = 'haor'
      and b.booking_status in ('pending', 'confirmed', 'checked_in')
      and b.booking_type = 'full_boat'
      and daterange(b.check_in_date, b.check_out_date, '[)') && daterange(new.start_date, new.end_date, '[)')
  ) then
    raise exception 'Full boat is already booked for this trip date';
  end if;

  if exists (
    select 1
    from public.trip_slot_manual_booking_room_ids(new.note) nr
    where exists (
        select 1
        from public.bookings b
        where coalesce(b.season_type, 'haor') = 'haor'
          and b.booking_status in ('pending', 'confirmed', 'checked_in')
          and daterange(b.check_in_date, b.check_out_date, '[)') && daterange(new.start_date, new.end_date, '[)')
          and (
            b.room_id::text = nr.room_id
            or exists (
              select 1
              from jsonb_array_elements(coalesce(b.room_details, '[]'::jsonb)) br
              where br->>'roomId' = nr.room_id
            )
          )
      )
  ) then
    raise exception 'Selected room is already booked for this trip date';
  end if;

  if exists (
    select 1
    from public.trip_slot_manual_booking_room_ids(new.note) nr
    where coalesce(nr.room_id, '') <> ''
      and exists (
        select 1
        from public.trip_slots t
        cross join lateral public.trip_slot_manual_booking_room_ids(t.note) tr
        where t.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          and daterange(t.start_date, t.end_date, '[)') && daterange(new.start_date, new.end_date, '[)')
          and tr.room_id = nr.room_id
      )
  ) then
    raise exception 'Selected room is already booked for this trip date';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_trip_slot_manual_room_conflicts_trigger on public.trip_slots;
create trigger prevent_trip_slot_manual_room_conflicts_trigger
before insert or update on public.trip_slots
for each row execute function public.prevent_trip_slot_manual_room_conflicts();


