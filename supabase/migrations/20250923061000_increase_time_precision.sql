-- Increase fractional precision for flight time columns to avoid truncating imported durations

ALTER TABLE public.flight_entries
ALTER COLUMN total_time TYPE NUMERIC(10,3),
ALTER COLUMN pic_time TYPE NUMERIC(10,3),
ALTER COLUMN cross_country_time TYPE NUMERIC(10,3),
ALTER COLUMN night_time TYPE NUMERIC(10,3),
ALTER COLUMN instrument_time TYPE NUMERIC(10,3),
ALTER COLUMN sic_time TYPE NUMERIC(10,3),
ALTER COLUMN solo_time TYPE NUMERIC(10,3),
ALTER COLUMN actual_instrument TYPE NUMERIC(10,3),
ALTER COLUMN simulated_instrument TYPE NUMERIC(10,3),
ALTER COLUMN dual_given TYPE NUMERIC(10,3),
ALTER COLUMN dual_received TYPE NUMERIC(10,3),
ALTER COLUMN simulated_flight TYPE NUMERIC(10,3),
ALTER COLUMN ground_training TYPE NUMERIC(10,3);
