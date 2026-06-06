-- Add promotional discount columns to houseboat_settings table

ALTER TABLE public.houseboat_settings
ADD COLUMN promo_discount_percent integer DEFAULT 0,
ADD COLUMN promo_discount_start_date date,
ADD COLUMN promo_discount_end_date date,
ADD COLUMN promo_discount_title text;
