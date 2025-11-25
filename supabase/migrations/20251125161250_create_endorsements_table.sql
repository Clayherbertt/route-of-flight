-- Create endorsements table to store all FAA endorsements
CREATE TABLE public.endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endorsement_number TEXT NOT NULL UNIQUE, -- e.g., "A.1", "A.2"
  section_id TEXT NOT NULL, -- e.g., "prerequisites", "student-pilot"
  section_title TEXT NOT NULL, -- e.g., "STUDENT PILOT ENDORSEMENTS"
  title TEXT NOT NULL, -- Short title/description
  far_reference TEXT, -- FAR reference like "§ 61.87(b)"
  endorsement_text TEXT NOT NULL, -- Full endorsement text
  category TEXT NOT NULL, -- e.g., "Student Pilot", "Practical Test", "Complex", etc.
  expires BOOLEAN DEFAULT false,
  expiration_days INTEGER, -- Number of days until expiration (e.g., 90)
  notes TEXT, -- Additional notes or requirements
  display_order INTEGER NOT NULL, -- Order within section
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active endorsements" 
ON public.endorsements 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage all endorsements" 
ON public.endorsements 
FOR ALL 
USING (is_admin());

-- Create indexes
CREATE INDEX idx_endorsements_section_id ON public.endorsements(section_id);
CREATE INDEX idx_endorsements_category ON public.endorsements(category);
CREATE INDEX idx_endorsements_number ON public.endorsements(endorsement_number);
CREATE INDEX idx_endorsements_display_order ON public.endorsements(section_id, display_order);

-- Create trigger for timestamps
CREATE TRIGGER update_endorsements_updated_at
BEFORE UPDATE ON public.endorsements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

