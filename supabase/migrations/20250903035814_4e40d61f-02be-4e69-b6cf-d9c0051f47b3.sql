-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create handle_new_user function for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  email TEXT,
  approval_status TEXT DEFAULT 'pending'
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own complete profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Only authenticated users can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update user approval status" ON public.profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete user profiles" ON public.profiles FOR DELETE USING (is_admin());

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (is_admin());

-- Create flight_entries table
CREATE TABLE public.flight_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  aircraft_registration TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  route TEXT,
  start_time TIME,
  end_time TIME,
  total_time NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  pic_time NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  sic_time NUMERIC(10,2) DEFAULT 0.0,
  solo_time NUMERIC(10,2) DEFAULT 0.0,
  cross_country_time NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  night_time NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  instrument_time NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  actual_instrument NUMERIC(10,2) DEFAULT 0.0,
  simulated_instrument NUMERIC(10,2) DEFAULT 0.0,
  day_takeoffs INTEGER DEFAULT 0,
  day_landings INTEGER DEFAULT 0,
  night_takeoffs INTEGER DEFAULT 0,
  night_landings INTEGER DEFAULT 0,
  landings INTEGER NOT NULL DEFAULT 0,
  holds INTEGER DEFAULT 0,
  approaches TEXT NOT NULL DEFAULT '0',
  dual_given NUMERIC(10,2) DEFAULT 0.0,
  dual_received NUMERIC(10,2) DEFAULT 0.0,
  simulated_flight NUMERIC(10,2) DEFAULT 0.0,
  ground_training NUMERIC(10,2) DEFAULT 0.0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on flight_entries
ALTER TABLE public.flight_entries ENABLE ROW LEVEL SECURITY;

-- Flight entries policies
CREATE POLICY "Users can view their own flight entries" ON public.flight_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own flight entries" ON public.flight_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flight entries" ON public.flight_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flight entries" ON public.flight_entries FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for flight_entries updated_at
CREATE TRIGGER update_flight_entries_updated_at
BEFORE UPDATE ON public.flight_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create aircraft_logbook table (personal aircraft database)
CREATE TABLE public.aircraft_logbook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('Aircraft', 'BATD', 'AATD', 'FTD')),
  aircraft_id TEXT NOT NULL,
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

-- Enable RLS on aircraft_logbook
ALTER TABLE public.aircraft_logbook ENABLE ROW LEVEL SECURITY;

-- Aircraft logbook policies
CREATE POLICY "Users can view their own aircraft" ON public.aircraft_logbook FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own aircraft" ON public.aircraft_logbook FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own aircraft" ON public.aircraft_logbook FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own aircraft" ON public.aircraft_logbook FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for aircraft_logbook updated_at
CREATE TRIGGER update_aircraft_logbook_updated_at
BEFORE UPDATE ON public.aircraft_logbook
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create aircraft table (marketplace listings)
CREATE TABLE public.aircraft (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  aircraft_type TEXT NOT NULL,
  location TEXT NOT NULL,
  price INTEGER NOT NULL,
  condition TEXT NOT NULL,
  description TEXT NOT NULL,
  total_hours INTEGER NOT NULL,
  engine_hours INTEGER,
  propeller_hours INTEGER,
  engine2_hours INTEGER,
  propeller2_hours INTEGER,
  serial_number TEXT,
  paint_rating TEXT,
  interior_rating TEXT,
  logbooks BOOLEAN DEFAULT false,
  annual BOOLEAN DEFAULT false,
  damage BOOLEAN DEFAULT false,
  last_annual_date TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  source TEXT DEFAULT 'user_submitted',
  source_url TEXT,
  external_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on aircraft
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

-- Aircraft policies
CREATE POLICY "Public can view approved aircraft listings" ON public.aircraft FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view their own aircraft listings" ON public.aircraft FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all aircraft listings" ON public.aircraft FOR SELECT USING (is_admin());
CREATE POLICY "Authenticated users can create aircraft listings" ON public.aircraft FOR INSERT WITH CHECK ((auth.uid() = user_id) AND ((status = 'pending') OR (status IS NULL)));
CREATE POLICY "Users can update their own pending or rejected aircraft listing" ON public.aircraft FOR UPDATE USING ((auth.uid() = user_id) AND ((status = ANY (ARRAY['pending', 'rejected'])) OR (status IS NULL))) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update aircraft listings for approval" ON public.aircraft FOR UPDATE USING (is_admin());
CREATE POLICY "Users can delete their own aircraft listings" ON public.aircraft FOR DELETE USING ((auth.uid() = user_id) OR is_admin());

-- Create aircraft_images table
CREATE TABLE public.aircraft_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aircraft_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on aircraft_images
ALTER TABLE public.aircraft_images ENABLE ROW LEVEL SECURITY;

-- Aircraft images policies
CREATE POLICY "Anyone can view aircraft images" ON public.aircraft_images FOR SELECT USING (true);
CREATE POLICY "Users can manage images for their own aircraft" ON public.aircraft_images FOR ALL USING (EXISTS (SELECT 1 FROM aircraft WHERE aircraft.id = aircraft_images.aircraft_id AND aircraft.user_id = auth.uid()));

-- Create aircraft_logbooks table (for file uploads)
CREATE TABLE public.aircraft_logbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aircraft_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on aircraft_logbooks
ALTER TABLE public.aircraft_logbooks ENABLE ROW LEVEL SECURITY;

-- Aircraft logbooks policies
CREATE POLICY "Users can view logbooks for their own aircraft" ON public.aircraft_logbooks FOR SELECT USING (EXISTS (SELECT 1 FROM aircraft WHERE aircraft.id = aircraft_logbooks.aircraft_id AND aircraft.user_id = auth.uid()));
CREATE POLICY "Admins can view all aircraft logbooks" ON public.aircraft_logbooks FOR SELECT USING (is_admin());
CREATE POLICY "Users can manage logbooks for their own aircraft" ON public.aircraft_logbooks FOR ALL USING (EXISTS (SELECT 1 FROM aircraft WHERE aircraft.id = aircraft_logbooks.aircraft_id AND aircraft.user_id = auth.uid()));

-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_tier TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Subscribers policies
CREATE POLICY "select_own_subscription" ON public.subscribers FOR SELECT USING ((user_id = auth.uid()) OR (email = auth.email()));
CREATE POLICY "insert_subscription" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "update_own_subscription" ON public.subscribers FOR UPDATE USING (true);