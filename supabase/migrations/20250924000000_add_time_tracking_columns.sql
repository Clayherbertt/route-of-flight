-- Add time tracking columns to flight_entries table
-- These columns were referenced in the code but missing from the database schema

ALTER TABLE public.flight_entries 
ADD COLUMN IF NOT EXISTS time_out text,
ADD COLUMN IF NOT EXISTS time_off text,
ADD COLUMN IF NOT EXISTS time_on text,
ADD COLUMN IF NOT EXISTS time_in text,
ADD COLUMN IF NOT EXISTS on_duty text,
ADD COLUMN IF NOT EXISTS off_duty text,
ADD COLUMN IF NOT EXISTS hobbs_start numeric,
ADD COLUMN IF NOT EXISTS hobbs_end numeric,
ADD COLUMN IF NOT EXISTS tach_start numeric,
ADD COLUMN IF NOT EXISTS tach_end numeric;

