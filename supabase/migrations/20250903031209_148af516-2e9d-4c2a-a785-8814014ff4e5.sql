-- Add new columns to flight_entries table for comprehensive flight logging
ALTER TABLE public.flight_entries 
ADD COLUMN IF NOT EXISTS route text,
ADD COLUMN IF NOT EXISTS start_time time,
ADD COLUMN IF NOT EXISTS end_time time,
ADD COLUMN IF NOT EXISTS sic_time numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS solo_time numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS day_takeoffs integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS day_landings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_takeoffs integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_landings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_instrument numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS simulated_instrument numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS holds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dual_given numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS dual_received numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS simulated_flight numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS ground_training numeric DEFAULT 0.0;

-- Update approaches column to be text type for better flexibility
ALTER TABLE public.flight_entries 
ALTER COLUMN approaches TYPE text USING approaches::text;