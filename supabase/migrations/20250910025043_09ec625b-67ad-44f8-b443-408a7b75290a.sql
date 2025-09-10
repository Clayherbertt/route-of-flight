-- Create user_routes table to store user's route selections
CREATE TABLE public.user_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_step_id UUID NOT NULL,
  step_category TEXT NOT NULL,
  wizard_step_key TEXT NOT NULL,
  order_number INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_routes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own route selections" 
ON public.user_routes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own route selections" 
ON public.user_routes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own route selections" 
ON public.user_routes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own route selections" 
ON public.user_routes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_routes_updated_at
BEFORE UPDATE ON public.user_routes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_user_routes_user_id ON public.user_routes(user_id);
CREATE INDEX idx_user_routes_step ON public.user_routes(route_step_id);