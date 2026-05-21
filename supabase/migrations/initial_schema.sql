-- Kuhelika / single-houseboat admin schema
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
  'কুহেলিকা',
  'An Aesthetic Water Villa',
  'টাঙ্গুয়ার হাওরের বুকে এক নান্দনিক হাউসবোট অভিজ্ঞতা।',
  '+880 1700-000000',
  '8801700000000',
  'info@example.com',
  'https://facebook.com',
  'টাঙ্গুয়ার হাওর, সুনামগঞ্জ',
  'তাহিরপুর ঘাট, সুনামগঞ্জ',
  '/logo-kuhelika-clean.png'
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
