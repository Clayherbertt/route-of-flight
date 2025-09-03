-- Fix numeric field precision to allow larger flight hour values
-- Current precision of NUMERIC(4,1) only allows up to 999.9
-- Update to NUMERIC(8,1) to allow up to 9999999.9 which should be sufficient for flight hours

ALTER TABLE public.flight_entries 
ALTER COLUMN total_time TYPE NUMERIC(8,1),
ALTER COLUMN pic_time TYPE NUMERIC(8,1),
ALTER COLUMN cross_country_time TYPE NUMERIC(8,1),
ALTER COLUMN night_time TYPE NUMERIC(8,1),
ALTER COLUMN instrument_time TYPE NUMERIC(8,1),
ALTER COLUMN sic_time TYPE NUMERIC(8,1),
ALTER COLUMN solo_time TYPE NUMERIC(8,1),
ALTER COLUMN actual_instrument TYPE NUMERIC(8,1),
ALTER COLUMN simulated_instrument TYPE NUMERIC(8,1),
ALTER COLUMN dual_given TYPE NUMERIC(8,1),
ALTER COLUMN dual_received TYPE NUMERIC(8,1),
ALTER COLUMN simulated_flight TYPE NUMERIC(8,1),
ALTER COLUMN ground_training TYPE NUMERIC(8,1);