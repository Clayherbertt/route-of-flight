-- Apply missing landing/takeoff columns to flight_entries table
-- Run this in Supabase SQL Editor if migrations can't be synced

-- These columns should already exist from migration 20250903031209, but adding IF NOT EXISTS to be safe
ALTER TABLE public.flight_entries 
ADD COLUMN IF NOT EXISTS day_takeoffs integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS day_landings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_takeoffs integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_landings integer DEFAULT 0;

-- These columns should already exist from migration 20250923073000, but adding IF NOT EXISTS to be safe
ALTER TABLE public.flight_entries
ADD COLUMN IF NOT EXISTS day_landings_full_stop integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_landings_full_stop integer DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'flight_entries' 
  AND column_name IN ('day_takeoffs', 'day_landings', 'day_landings_full_stop', 'night_takeoffs', 'night_landings', 'night_landings_full_stop')
ORDER BY column_name;

