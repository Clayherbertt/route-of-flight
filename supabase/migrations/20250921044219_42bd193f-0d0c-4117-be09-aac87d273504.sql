-- Add unique constraint to prevent duplicate flight entries
-- A flight is considered unique based on user, date, aircraft, and route
ALTER TABLE public.flight_entries 
ADD CONSTRAINT flight_entries_unique_flight 
UNIQUE (user_id, date, aircraft_registration, departure_airport, arrival_airport);