-- Remove duplicate flight entries, keeping only the first occurrence of each duplicate
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, date, aircraft_registration, departure_airport, arrival_airport 
      ORDER BY created_at ASC
    ) as row_num
  FROM public.flight_entries
)
DELETE FROM public.flight_entries 
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE public.flight_entries 
ADD CONSTRAINT flight_entries_unique_flight 
UNIQUE (user_id, date, aircraft_registration, departure_airport, arrival_airport);