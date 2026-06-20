-- supabase/migrations/008_create_menu_images_bucket.sql

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "shop_admin_can_manage_own_images" ON storage.objects;
DROP POLICY IF EXISTS "platform_admin_can_manage_all_images" ON storage.objects;
DROP POLICY IF EXISTS "anyone_can_read_menu_images" ON storage.objects;

-- Create the menu-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Shop admin can upload/read/delete within their shop folder
CREATE POLICY "shop_admin_can_manage_own_images" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1]::uuid = (
      SELECT s.id FROM shops s
      WHERE s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1]::uuid = (
      SELECT s.id FROM shops s
      WHERE s.owner_id = auth.uid()
    )
  );

-- Policy: Platform admin can manage all images
CREATE POLICY "platform_admin_can_manage_all_images" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'menu-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  )
  WITH CHECK (
    bucket_id = 'menu-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  );

-- Policy: Anyone can read public images (for customer menu viewing)
CREATE POLICY "anyone_can_read_menu_images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-images');
