-- Create airlines table to store all airline information
CREATE TABLE public.airlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo TEXT DEFAULT '✈️',
  call_sign TEXT NOT NULL,
  pilot_group_size TEXT NOT NULL,
  fleet_size INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  pilot_union TEXT NOT NULL,
  fleet_info JSONB DEFAULT '[]'::jsonb,
  bases TEXT[] DEFAULT '{}',
  is_hiring BOOLEAN DEFAULT false,
  application_url TEXT,
  required_qualifications TEXT[] DEFAULT '{}',
  preferred_qualifications TEXT[] DEFAULT '{}',
  inside_scoop TEXT[] DEFAULT '{}',
  most_junior_base TEXT,
  most_junior_captain_hire_date TEXT,
  retirements_in_2025 INTEGER DEFAULT 0,
  fo_pay_year_1 TEXT,
  fo_pay_year_5 TEXT,
  fo_pay_year_10 TEXT,
  captain_pay_year_1 TEXT,
  captain_pay_year_5 TEXT,
  captain_pay_year_10 TEXT,
  additional_info TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Majors',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active airlines" 
ON public.airlines 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage all airlines" 
ON public.airlines 
FOR ALL 
USING (is_admin());

-- Create trigger for timestamps
CREATE TRIGGER update_airlines_updated_at
BEFORE UPDATE ON public.airlines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing airline data
INSERT INTO public.airlines (
  name, call_sign, pilot_group_size, fleet_size, description, pilot_union,
  fleet_info, bases, is_hiring, application_url, required_qualifications,
  preferred_qualifications, inside_scoop, most_junior_base, 
  most_junior_captain_hire_date, retirements_in_2025,
  fo_pay_year_1, fo_pay_year_5, fo_pay_year_10,
  captain_pay_year_1, captain_pay_year_5, captain_pay_year_10,
  additional_info, category
) VALUES 
(
  'Alaska Airlines', 'Alaska', '3,200+', 314,
  'Alaska Airlines is a major American airline known for exceptional customer service and reliability, serving the West Coast and Alaska.',
  'ALPA (Air Line Pilots Association)',
  '[{"type": "Boeing 737-700", "quantity": 32}, {"type": "Boeing 737-800", "quantity": 61}, {"type": "Boeing 737-900", "quantity": 76}, {"type": "Boeing 737 MAX 8", "quantity": 45}, {"type": "Boeing 737 MAX 9", "quantity": 67}, {"type": "Airbus A320", "quantity": 12}, {"type": "Airbus A321neo", "quantity": 21}]'::jsonb,
  '{"Seattle (SEA)", "Anchorage (ANC)", "Los Angeles (LAX)", "San Francisco (SFO)", "Portland (PDX)"}',
  true, 'https://careers.alaskaair.com/pilots',
  '{"Minimum 1,500 hours total time", "ATP Certificate or meet ATP requirements", "Current First Class Medical", "500 hours fixed wing turbine time", "Current passport with 6+ months validity", "Must be 23+ years old", "High school diploma or equivalent"}',
  '{"Bachelor''s degree", "500 hours turbine PIC time", "50+ hours flight time in last 12 months", "Multi-engine experience"}',
  '{"Known for excellent work-life balance", "Strong company culture and employee satisfaction", "Growing route network with Hawaiian acquisition"}',
  'Seattle (SEA)', 'March 2019', 85,
  '$108.16/hr', '$201.45/hr', '$224.41/hr',
  '$300.31/hr', '$311.31/hr', '$325.31/hr',
  '{"Industry-leading pilot contract ratified in 2022", "Market rate adjustment keeps pilots competitive", "Strong job security with growth opportunities"}',
  'Majors'
),
(
  'Delta Air Lines', 'Delta', '15,000+', 865,
  'One of the major legacy carriers in the United States, known for premium service and global network.',
  'ALPA (Air Line Pilots Association)',
  '[{"type": "Boeing 777", "quantity": 25}, {"type": "Airbus A350", "quantity": 28}, {"type": "Boeing 787", "quantity": 31}, {"type": "Airbus A330", "quantity": 36}, {"type": "Boeing 767", "quantity": 44}, {"type": "Boeing 757", "quantity": 111}, {"type": "Airbus A321", "quantity": 127}, {"type": "Boeing 737", "quantity": 255}, {"type": "Airbus A320/319", "quantity": 108}, {"type": "Airbus A220", "quantity": 95}]'::jsonb,
  '{"Atlanta (ATL)", "Detroit (DTW)", "Minneapolis (MSP)", "New York JFK (JFK)", "Los Angeles (LAX)", "Seattle (SEA)", "Salt Lake City (SLC)", "Boston (BOS)"}',
  true, 'https://careers.delta.com/pilots',
  '{"ATP Certificate", "Current First Class Medical", "Minimum 1,500 hours total time", "250 hours PIC or SIC", "50 hours multi-engine time", "Bachelor''s degree preferred", "Current passport"}',
  '{"1,000+ hours turbine time", "Bachelor''s degree from accredited university", "100+ hours flight time in last 12 months"}',
  '{"Highly selective hiring process", "Excellent benefits and profit sharing", "Premium airline with global destinations"}',
  'New York JFK (JFK)', 'January 2018', 450,
  '$118.31/hr', '$276.92/hr', '$305.88/hr',
  '$418.37/hr', '$432.08/hr', '$449.11/hr',
  '{"Industry-leading compensation packages", "16% company contribution to 401(k)", "Extensive profit sharing program"}',
  'Majors'
),
(
  'Spirit', 'Spirit Wings', '3,000+', 186,
  'Ultra-low-cost carrier known for unbundled pricing model and point-to-point service throughout the United States, Caribbean, and Latin America.',
  'ALPA (Air Line Pilots Association)',
  '[{"type": "Airbus A319", "quantity": 31}, {"type": "Airbus A320", "quantity": 81}, {"type": "Airbus A321", "quantity": 74}]'::jsonb,
  '{"Fort Lauderdale (FLL)", "Detroit (DTW)", "Las Vegas (LAS)", "Chicago (ORD)", "Dallas (DFW)", "Houston (IAH)", "Orlando (MCO)", "Atlantic City (ACY)"}',
  true, 'https://careers.spirit.com/pilots',
  '{"ATP Certificate or meet ATP requirements", "Current First Class Medical", "Minimum 1,500 hours total time", "Multi-engine land rating", "Current passport", "Must be 23+ years old"}',
  '{"Bachelor''s degree", "1,000+ hours turbine time", "Part 121 experience", "Airbus experience"}',
  '{"Growing ULCC with expansion opportunities", "Single aircraft family operations", "Competitive entry-level airline"}',
  'Orlando (MCO)', 'August 2019', 25,
  '$90.00/hr', '$165.00/hr', '$185.00/hr',
  '$240.00/hr', '$255.00/hr', '$270.00/hr',
  '{"Rapid growth and fleet expansion", "Focus on leisure destinations", "Strong operational reliability"}',
  'Ultra Low Cost Carriers & Large Operators'
);