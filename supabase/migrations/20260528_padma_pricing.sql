-- Padma Day Long per-person pricing.

alter table public.houseboat_settings
  add column if not exists padma_price_per_person numeric(12,2) not null default 0;

