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
