-- Ensure REPLICA IDENTITY FULL is set for complete real-time updates
ALTER TABLE public.airlines REPLICA IDENTITY FULL;