-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('aircraft-images', 'aircraft-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('aircraft-logbooks', 'aircraft-logbooks', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for aircraft-images bucket
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access for aircraft-images'
  ) THEN
    CREATE POLICY "Public Access for aircraft-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'aircraft-images');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload aircraft images'
  ) THEN
    CREATE POLICY "Users can upload aircraft images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'aircraft-images' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Create storage policies for aircraft-logbooks bucket
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can access their own logbooks'
  ) THEN
    CREATE POLICY "Users can access their own logbooks"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'aircraft-logbooks' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own logbooks'
  ) THEN
    CREATE POLICY "Users can upload their own logbooks"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'aircraft-logbooks' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;