-- Admins explicites + RLS stricte (seuls les user_id listés ont accès écriture / brouillons).
-- Après migration : dans le SQL Editor (rôle postgres), exécuter par ex. :
--   INSERT INTO public.site_admins (user_id)
--   VALUES ('<uuid de Authentication → Users>');
-- (L’UUID se copie depuis le dashboard Supabase après création du compte.)

CREATE TABLE IF NOT EXISTS public.site_admins (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.site_admins IS 'Comptes autorisés à l’admin CMS ; géré manuellement ou via SQL (service role).';

ALTER TABLE public.site_admins ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.site_admins FROM PUBLIC;
GRANT ALL ON TABLE public.site_admins TO postgres, service_role;

CREATE OR REPLACE FUNCTION public.is_site_admin ()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.site_admins s
    WHERE s.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_site_admin () FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_site_admin () TO anon, authenticated;

-- --- Retrait des anciennes politiques ---------------------------------------

DROP POLICY IF EXISTS realisations_select_anon ON public.realisations;
DROP POLICY IF EXISTS realisations_all_authenticated ON public.realisations;

DROP POLICY IF EXISTS service_publications_select_anon ON public.service_publications;
DROP POLICY IF EXISTS service_publications_all_authenticated ON public.service_publications;

DROP POLICY IF EXISTS site_settings_select_anon ON public.site_settings;
DROP POLICY IF EXISTS site_settings_all_authenticated ON public.site_settings;

DROP POLICY IF EXISTS opportunity_posts_select_anon ON public.opportunity_posts;
DROP POLICY IF EXISTS opportunity_posts_all_authenticated ON public.opportunity_posts;

DROP POLICY IF EXISTS opportunity_history_all_authenticated ON public.opportunity_post_history;

DROP POLICY IF EXISTS opportunity_subscribers_insert_anon ON public.opportunity_feed_subscribers;
DROP POLICY IF EXISTS opportunity_subscribers_all_authenticated ON public.opportunity_feed_subscribers;

DROP POLICY IF EXISTS storage_admin_media_select ON storage.objects;
DROP POLICY IF EXISTS storage_admin_media_insert ON storage.objects;
DROP POLICY IF EXISTS storage_admin_media_update ON storage.objects;
DROP POLICY IF EXISTS storage_admin_media_delete ON storage.objects;

-- --- realisations -----------------------------------------------------------

CREATE POLICY realisations_select_public ON public.realisations
  FOR SELECT TO anon, authenticated
  USING (published = true OR public.is_site_admin ());

CREATE POLICY realisations_insert_admin ON public.realisations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin ());

CREATE POLICY realisations_update_admin ON public.realisations
  FOR UPDATE TO authenticated
  USING (public.is_site_admin ())
  WITH CHECK (public.is_site_admin ());

CREATE POLICY realisations_delete_admin ON public.realisations
  FOR DELETE TO authenticated
  USING (public.is_site_admin ());

-- --- service_publications -----------------------------------------------------

CREATE POLICY service_publications_select_public ON public.service_publications
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY service_publications_insert_admin ON public.service_publications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin ());

CREATE POLICY service_publications_update_admin ON public.service_publications
  FOR UPDATE TO authenticated
  USING (public.is_site_admin ())
  WITH CHECK (public.is_site_admin ());

CREATE POLICY service_publications_delete_admin ON public.service_publications
  FOR DELETE TO authenticated
  USING (public.is_site_admin ());

-- --- site_settings ----------------------------------------------------------

CREATE POLICY site_settings_select_public ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY site_settings_insert_admin ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin ());

CREATE POLICY site_settings_update_admin ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.is_site_admin ())
  WITH CHECK (public.is_site_admin ());

CREATE POLICY site_settings_delete_admin ON public.site_settings
  FOR DELETE TO authenticated
  USING (public.is_site_admin ());

-- --- opportunity_posts ------------------------------------------------------

CREATE POLICY opportunity_posts_select_public ON public.opportunity_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.is_site_admin ());

CREATE POLICY opportunity_posts_insert_admin ON public.opportunity_posts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin ());

CREATE POLICY opportunity_posts_update_admin ON public.opportunity_posts
  FOR UPDATE TO authenticated
  USING (public.is_site_admin ())
  WITH CHECK (public.is_site_admin ());

CREATE POLICY opportunity_posts_delete_admin ON public.opportunity_posts
  FOR DELETE TO authenticated
  USING (public.is_site_admin ());

-- --- opportunity_post_history ------------------------------------------------

CREATE POLICY opportunity_history_select_admin ON public.opportunity_post_history
  FOR SELECT TO authenticated
  USING (public.is_site_admin ());

CREATE POLICY opportunity_history_insert_admin ON public.opportunity_post_history
  FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin ());

CREATE POLICY opportunity_history_update_admin ON public.opportunity_post_history
  FOR UPDATE TO authenticated
  USING (public.is_site_admin ())
  WITH CHECK (public.is_site_admin ());

CREATE POLICY opportunity_history_delete_admin ON public.opportunity_post_history
  FOR DELETE TO authenticated
  USING (public.is_site_admin ());

-- --- opportunity_feed_subscribers -------------------------------------------

CREATE POLICY opportunity_subscribers_insert_anon ON public.opportunity_feed_subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY opportunity_subscribers_select_admin ON public.opportunity_feed_subscribers
  FOR SELECT TO authenticated
  USING (public.is_site_admin ());

CREATE POLICY opportunity_subscribers_delete_admin ON public.opportunity_feed_subscribers
  FOR DELETE TO authenticated
  USING (public.is_site_admin ());

-- --- Storage ----------------------------------------------------------------

CREATE POLICY storage_admin_media_select ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'admin-media');

CREATE POLICY storage_admin_media_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'admin-media' AND public.is_site_admin ());

CREATE POLICY storage_admin_media_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'admin-media' AND public.is_site_admin ())
  WITH CHECK (bucket_id = 'admin-media' AND public.is_site_admin ());

CREATE POLICY storage_admin_media_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'admin-media' AND public.is_site_admin ());
