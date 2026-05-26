-- Add transaction_id to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS transaction_id text;
