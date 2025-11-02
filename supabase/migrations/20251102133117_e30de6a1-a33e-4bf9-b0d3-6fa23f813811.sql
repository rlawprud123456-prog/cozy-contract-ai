-- Create storage bucket for community images if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'community-images') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('community-images', 'community-images', true);
  END IF;
END $$;

-- Storage policies for community images
DO $$
BEGIN
  -- Check and create policy for viewing
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view community images'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view community images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = ''community-images'')';
  END IF;

  -- Check and create policy for uploading
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload community images'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can upload community images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = ''community-images'' 
      AND auth.role() = ''authenticated''
    )';
  END IF;

  -- Check and create policy for updating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own community images'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own community images"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = ''community-images'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;

  -- Check and create policy for deleting
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own community images'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own community images"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = ''community-images'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;
END $$;