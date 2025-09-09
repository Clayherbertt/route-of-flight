-- Create table for route steps
CREATE TABLE public.route_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'GraduationCap',
  order_number integer NOT NULL,
  mandatory boolean NOT NULL DEFAULT false,
  allow_customer_reorder boolean NOT NULL DEFAULT false,
  overview text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for route step details (key topics)
CREATE TABLE public.route_step_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_step_id uuid NOT NULL REFERENCES public.route_steps(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  flight_hours integer DEFAULT NULL,
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for route step connections (next steps)
CREATE TABLE public.route_step_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_step_id uuid NOT NULL REFERENCES public.route_steps(id) ON DELETE CASCADE,
  to_step_id uuid NOT NULL REFERENCES public.route_steps(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(from_step_id, to_step_id)
);

-- Enable RLS on all tables
ALTER TABLE public.route_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_step_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_step_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for route_steps
CREATE POLICY "Anyone can view published route steps" 
ON public.route_steps 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage all route steps" 
ON public.route_steps 
FOR ALL 
USING (is_admin());

-- Create policies for route_step_details
CREATE POLICY "Anyone can view details of published steps" 
ON public.route_step_details 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.route_steps 
  WHERE id = route_step_details.route_step_id 
  AND status = 'published'
));

CREATE POLICY "Admins can manage all route step details" 
ON public.route_step_details 
FOR ALL 
USING (is_admin());

-- Create policies for route_step_connections
CREATE POLICY "Anyone can view connections of published steps" 
ON public.route_step_connections 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.route_steps 
  WHERE id = route_step_connections.from_step_id 
  AND status = 'published'
));

CREATE POLICY "Admins can manage all route step connections" 
ON public.route_step_connections 
FOR ALL 
USING (is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_route_steps_updated_at
  BEFORE UPDATE ON public.route_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_route_step_details_updated_at
  BEFORE UPDATE ON public.route_step_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.route_steps (id, title, description, icon, order_number, mandatory, allow_customer_reorder, overview, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'School Shopping & Discovery Flight', 'First step in aviation career - choosing a school and taking your first flight', 'GraduationCap', 1, true, false, 'Learn about different types of flight schools and take your first discovery flight', 'published'),
('550e8400-e29b-41d4-a716-446655440002', 'First Class Medical Certificate', 'Obtain your FAA medical certificate to ensure flight eligibility', 'Stethoscope', 2, true, true, 'Get your medical certificate from an FAA-approved Aviation Medical Examiner', 'published'),
('550e8400-e29b-41d4-a716-446655440003', 'Private Pilot License Training', 'Begin your formal flight training toward your first pilot certificate', 'Plane', 3, true, false, 'Start your PPL training with ground school and flight lessons', 'draft');

-- Insert sample details
INSERT INTO public.route_step_details (route_step_id, title, description, checked, flight_hours, order_number) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Part 61 vs Part 141 schools', 'Understand the differences between Part 61 and Part 141 flight training programs, including their structure, requirements, and which might be best for your goals.', false, null, 1),
('550e8400-e29b-41d4-a716-446655440001', 'University programs vs flight academies', 'Compare collegiate aviation programs with dedicated flight academies, considering factors like cost, timeline, and career preparation.', false, null, 2),
('550e8400-e29b-41d4-a716-446655440001', 'What to expect in a discovery flight', 'Learn what happens during your first flight lesson, how to prepare, and what questions to ask your instructor.', false, null, 3),
('550e8400-e29b-41d4-a716-446655440001', 'Questions to ask during school visits', 'Essential questions about aircraft condition, instructor qualifications, safety records, and financing options.', false, null, 4),

('550e8400-e29b-41d4-a716-446655440002', 'Finding an Aviation Medical Examiner (AME)', 'Locate FAA-authorized doctors in your area and understand the examination process.', false, null, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Required medical documentation', 'Gather necessary medical records, prescriptions, and documentation before your exam.', false, null, 2),
('550e8400-e29b-41d4-a716-446655440002', 'Common medical disqualifiers', 'Learn about conditions that might affect your medical certificate and potential solutions.', false, null, 3),
('550e8400-e29b-41d4-a716-446655440002', 'Special issuance process if needed', 'Understand the special issuance process for conditions requiring additional FAA review.', false, null, 4),

('550e8400-e29b-41d4-a716-446655440003', 'Ground school requirements', 'Complete the theoretical knowledge portion of pilot training covering aerodynamics, weather, navigation, and regulations.', false, null, 1),
('550e8400-e29b-41d4-a716-446655440003', 'Flight training minimums', 'Understanding minimum flight hour requirements and what skills you''ll develop during training.', false, 40, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Written exam preparation', 'Prepare for the FAA knowledge test with study materials, practice tests, and test-taking strategies.', false, null, 3),
('550e8400-e29b-41d4-a716-446655440003', 'Checkride preparation', 'Get ready for your practical exam with oral preparation and flight test requirements.', false, null, 4);

-- Insert sample connections
INSERT INTO public.route_step_connections (from_step_id, to_step_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');