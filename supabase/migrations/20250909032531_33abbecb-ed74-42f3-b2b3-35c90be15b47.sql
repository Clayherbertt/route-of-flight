-- Enable realtime for the airlines table
ALTER TABLE public.airlines REPLICA IDENTITY FULL;

-- Add the airlines table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.airlines;