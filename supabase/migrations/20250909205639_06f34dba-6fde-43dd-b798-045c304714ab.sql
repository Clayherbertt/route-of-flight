-- Create table for route step sub topics
CREATE TABLE public.route_step_sub_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_step_detail_id UUID NOT NULL,
  title TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  flight_hours INTEGER,
  order_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.route_step_sub_topics ENABLE ROW LEVEL SECURITY;

-- Create policies for sub topics
CREATE POLICY "Anyone can view sub topics of published steps" 
ON public.route_step_sub_topics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM route_step_details rsd
  JOIN route_steps rs ON rs.id = rsd.route_step_id
  WHERE rsd.id = route_step_sub_topics.route_step_detail_id 
  AND rs.status = 'published'
));

CREATE POLICY "Admins can manage all route step sub topics" 
ON public.route_step_sub_topics 
FOR ALL 
USING (is_admin());

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_route_step_sub_topics_updated_at
BEFORE UPDATE ON public.route_step_sub_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();