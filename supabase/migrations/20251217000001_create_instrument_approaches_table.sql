-- Create instrument_approaches table to store published instrument approaches for each airport
CREATE TABLE public.instrument_approaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_code TEXT NOT NULL, -- ICAO or IATA code (e.g., "KJFK", "KLGA")
  approach_name TEXT NOT NULL, -- e.g., "ILS 13L", "RNAV 22", "VOR-A"
  approach_type TEXT NOT NULL, -- ILS, RNAV, VOR, LOC, NDB, etc.
  runway TEXT, -- e.g., "13L", "22", "A" (for circling)
  minimums_category TEXT, -- CAT I, CAT II, CAT III, etc.
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(airport_code, approach_name)
);

-- Index for fast lookups by airport
CREATE INDEX idx_instrument_approaches_airport_code ON public.instrument_approaches(airport_code);
CREATE INDEX idx_instrument_approaches_active ON public.instrument_approaches(airport_code, active) WHERE active = true;

-- Enable RLS
ALTER TABLE public.instrument_approaches ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view active approaches
CREATE POLICY "Anyone can view active approaches" 
ON public.instrument_approaches 
FOR SELECT 
USING (active = true);

-- Allow admins to manage all approaches
CREATE POLICY "Admins can manage all approaches" 
ON public.instrument_approaches 
FOR ALL 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_instrument_approaches_updated_at
BEFORE UPDATE ON public.instrument_approaches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment to document the table
COMMENT ON TABLE public.instrument_approaches IS 'Stores published instrument approach procedures for airports';

