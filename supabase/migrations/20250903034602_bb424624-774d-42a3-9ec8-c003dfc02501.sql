-- Create aircraft_logbook table for personal aircraft tracking
CREATE TABLE public.aircraft_logbook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('Aircraft', 'BATD', 'AATD', 'FTD')),
  aircraft_id TEXT NOT NULL, -- Tail number/registration
  type_code TEXT,
  category_class TEXT NOT NULL CHECK (category_class IN ('ASEL', 'AMEL', 'ASES', 'AMES', 'RH', 'RG', 'Glider', 'LA', 'LB', 'PLIFT', 'PL', 'PS', 'WL', 'WS')),
  year INTEGER,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  gear_type TEXT CHECK (gear_type IN ('AM', 'FC', 'FT', 'FL', 'RC', 'RT', 'Skids', 'Skis')),
  engine_type TEXT CHECK (engine_type IN ('Diesel', 'Electric', 'Non-Powered', 'Piston', 'Radial', 'TurboFan', 'Turbojet', 'TurboProp', 'Turboshaft')),
  complex BOOLEAN DEFAULT false,
  taa BOOLEAN DEFAULT false,
  high_performance BOOLEAN DEFAULT false,
  pressurized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.aircraft_logbook ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own aircraft" 
ON public.aircraft_logbook 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own aircraft" 
ON public.aircraft_logbook 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aircraft" 
ON public.aircraft_logbook 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aircraft" 
ON public.aircraft_logbook 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_aircraft_logbook_updated_at
BEFORE UPDATE ON public.aircraft_logbook
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();