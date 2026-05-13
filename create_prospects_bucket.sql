-- Create the storage bucket for prospects (photos terrain)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prospects', 'prospects', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow public read access
DROP POLICY IF EXISTS "Public Access Prospects" ON storage.objects;
CREATE POLICY "Public Access Prospects"
ON storage.objects FOR SELECT
USING ( bucket_id = 'prospects' );

-- Policy 2: Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload prospects" ON storage.objects;
CREATE POLICY "Authenticated users can upload prospects"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'prospects' 
    AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to delete/update their own
DROP POLICY IF EXISTS "Authenticated users can manage own prospects" ON storage.objects;
CREATE POLICY "Authenticated users can manage own prospects"
ON storage.objects FOR ALL
USING (
    bucket_id = 'prospects' 
    AND auth.uid() = owner
);
