-- Add pay_scale_image_url column to airlines table
ALTER TABLE public.airlines 
ADD COLUMN IF NOT EXISTS pay_scale_image_url TEXT;

