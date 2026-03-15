INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Public read access on user-uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);