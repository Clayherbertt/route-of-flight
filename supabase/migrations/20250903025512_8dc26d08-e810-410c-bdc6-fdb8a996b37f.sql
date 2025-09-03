-- Create flight_entries table for individual user logbook data
CREATE TABLE public.flight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  aircraft_registration TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  total_time DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  pic_time DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  cross_country_time DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  night_time DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  instrument_time DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  approaches INTEGER NOT NULL DEFAULT 0,
  landings INTEGER NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flight_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access control
CREATE POLICY "Users can view their own flight entries" 
ON public.flight_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flight entries" 
ON public.flight_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flight entries" 
ON public.flight_entries 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flight entries" 
ON public.flight_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_flight_entries_updated_at
BEFORE UPDATE ON public.flight_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_flight_entries_user_id ON public.flight_entries(user_id);
CREATE INDEX idx_flight_entries_date ON public.flight_entries(date DESC);
CREATE INDEX idx_flight_entries_user_date ON public.flight_entries(user_id, date DESC);