-- ============================================================================
-- Storage : bucket admin-media — MIME (pJPEG) + RLS sur storage.objects
-- ============================================================================
-- Corrige notamment les uploads refusés (400) si allowed_mime_types exclut
-- image/pjpeg alors que le navigateur l’envoie pour certains JPEG.

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]::text[]
WHERE id = 'admin-media';

-- Lecture publique (bucket créé public par apply-migration / dashboard)
DROP POLICY IF EXISTS "orbis_admin_media_select" ON storage.objects;
CREATE POLICY "orbis_admin_media_select"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'admin-media');

-- Écriture réservée aux admins site (même logique que les tables public.*)
DROP POLICY IF EXISTS "orbis_admin_media_insert" ON storage.objects;
CREATE POLICY "orbis_admin_media_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'admin-media'
    AND (SELECT public.is_site_admin())
  );

DROP POLICY IF EXISTS "orbis_admin_media_update" ON storage.objects;
CREATE POLICY "orbis_admin_media_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'admin-media' AND (SELECT public.is_site_admin()))
  WITH CHECK (bucket_id = 'admin-media' AND (SELECT public.is_site_admin()));

DROP POLICY IF EXISTS "orbis_admin_media_delete" ON storage.objects;
CREATE POLICY "orbis_admin_media_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'admin-media' AND (SELECT public.is_site_admin()));
