-- Add admin delete policies to allow admins to delete any user's data

-- Allow admins to delete from subscribers
DROP POLICY IF EXISTS "Admins can delete any subscriber" ON public.subscribers;
CREATE POLICY "Admins can delete any subscriber" 
ON public.subscribers
FOR DELETE
USING (public.is_admin());

-- Allow admins to delete from user_routes
DROP POLICY IF EXISTS "Admins can delete any user route" ON public.user_routes;
CREATE POLICY "Admins can delete any user route" 
ON public.user_routes
FOR DELETE
USING (public.is_admin());

-- Allow admins to delete from flight_entries
DROP POLICY IF EXISTS "Admins can delete any flight entry" ON public.flight_entries;
CREATE POLICY "Admins can delete any flight entry" 
ON public.flight_entries
FOR DELETE
USING (public.is_admin());

-- Allow admins to delete from aircraft_logbook
DROP POLICY IF EXISTS "Admins can delete any aircraft" ON public.aircraft_logbook;
CREATE POLICY "Admins can delete any aircraft" 
ON public.aircraft_logbook
FOR DELETE
USING (public.is_admin());

-- Allow admins to delete from user_endorsements (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_endorsements') THEN
    DROP POLICY IF EXISTS "Admins can delete any endorsement" ON public.user_endorsements;
    EXECUTE 'CREATE POLICY "Admins can delete any endorsement" 
             ON public.user_endorsements
             FOR DELETE
             USING (public.is_admin())';
  END IF;
END $$;

