-- 05_storage_setup.sql

-- Enable storage if not enabled (handled by Supabase backend automatically usually, but we need to create the bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for product-images

-- Allow public read access to product-images
CREATE POLICY "Public Read Access for product-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Allow admins to insert/upload images
CREATE POLICY "Admin Insert Access for product-images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.is_admin()
);

-- Allow admins to update images
CREATE POLICY "Admin Update Access for product-images" 
ON storage.objects FOR UPDATE 
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.is_admin()
);

-- Allow admins to delete images
CREATE POLICY "Admin Delete Access for product-images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'product-images' 
  AND public.is_admin()
);
