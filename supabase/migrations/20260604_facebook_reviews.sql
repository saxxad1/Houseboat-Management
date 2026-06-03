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
