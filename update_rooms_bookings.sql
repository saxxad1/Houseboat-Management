-- Add new columns for dynamic room pricing based on occupancy
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS price_2_pax numeric;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS price_3_pax numeric;

-- Add new column to support multi-room bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_details jsonb;

-- Optional: Update existing rooms with some default data if they don't have it
-- You can set prices in the Admin Panel later.
UPDATE rooms SET price_2_pax = price_per_night WHERE price_2_pax IS NULL;
UPDATE rooms SET price_3_pax = price_per_night WHERE price_3_pax IS NULL;
