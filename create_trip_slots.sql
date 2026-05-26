create table public.trip_slots (
  id uuid default gen_random_uuid() primary key,
  start_date date not null,
  end_date date not null,
  duration_label varchar(255) default '2 Days 1 Night',
  status varchar(50) default 'available' not null,
  reason varchar(255),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table public.trip_slots enable row level security;

create policy "Public can read trip slots"
  on public.trip_slots
  for select
  using (true);

create policy "Admins can manage trip slots"
  on public.trip_slots
  for all
  using (auth.uid() in (select user_id from public.admin_profiles));
