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
