-- Remove the overly restrictive unique constraint that prevents multiple flights per day
ALTER TABLE public.flight_entries DROP CONSTRAINT IF EXISTS flight_entries_user_id_date_aircraft_registration_departure__key;

-- Also remove any other similar constraints that might exist
ALTER TABLE public.flight_entries DROP CONSTRAINT IF EXISTS flight_entries_unique_flight;
ALTER TABLE public.flight_entries DROP CONSTRAINT IF EXISTS unique_flight_entry;