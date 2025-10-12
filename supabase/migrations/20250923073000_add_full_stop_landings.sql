-- Add full stop landing columns to align with frontend expectations

ALTER TABLE public.flight_entries
ADD COLUMN IF NOT EXISTS day_landings_full_stop integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_landings_full_stop integer DEFAULT 0;
