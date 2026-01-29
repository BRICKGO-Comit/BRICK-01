-- Create the storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if it's not already enabled (it usually is by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (viewing images) for everyone
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'thumbnails' );

-- Policy 2: Allow authenticated users (admins/commercials) to upload images
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'thumbnails' 
    AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update/overwrite their own uploads
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'thumbnails' 
    AND auth.uid() = owner
);

-- Policy 4: Allow authenticated users to delete images
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'thumbnails' 
    AND auth.uid() = owner
);
