-- Orbis Publica : schéma Postgres aligné sur l’ancien SQLite (server/db.js).
-- Appliquer via Supabase Dashboard → SQL, ou `supabase db push`, ou MCP Supabase `execute_sql`.
-- Après migration : Auth → créer un utilisateur admin (e-mail / mot de passe) pour l’espace d’administration.

-- --- Tables -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.realisations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_publications (
  slug text PRIMARY KEY,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  content_json text
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value_json text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.opportunity_posts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  link_url text,
  status text NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  image_url text,
  attachments_json text,
  consultation_deadline date,
  organisme text,
  lieu text,
  CONSTRAINT opportunity_posts_status_ck CHECK (status IN ('draft', 'scheduled', 'published'))
);

CREATE TABLE IF NOT EXISTS public.opportunity_post_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id bigint REFERENCES public.opportunity_posts (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  detail_json text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.opportunity_feed_subscribers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category text NOT NULL,
  email text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, category)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_posts_category_status
  ON public.opportunity_posts (category, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_opportunity_posts_scheduled
  ON public.opportunity_posts (status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_opportunity_history_created
  ON public.opportunity_post_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_feed_subscribers_cat
  ON public.opportunity_feed_subscribers (category, created_at DESC);

-- --- Données initiales (expertises) -----------------------------------------

INSERT INTO public.service_publications (slug, published, sort_order, updated_at)
VALUES
  ('marches-publics', true, 0, now()),
  ('projets', true, 1, now()),
  ('financements-subventions', true, 2, now()),
  ('gouvernance-structuration', true, 3, now()),
  ('optimisation-fiscale', true, 4, now()),
  ('audit-conformite', true, 5, now()),
  ('contentieux-publics', true, 6, now()),
  ('formation-recherche', true, 7, now())
ON CONFLICT (slug) DO NOTHING;

-- --- Fonctions utilitaires --------------------------------------------------

CREATE OR REPLACE FUNCTION public.process_due_scheduled_opportunity_posts ()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer := 0;
  r record;
  now_ts timestamptz := now();
BEGIN
  FOR r IN
    SELECT id
    FROM public.opportunity_posts
    WHERE status = 'scheduled'
      AND scheduled_for IS NOT NULL
      AND scheduled_for <= now_ts
  LOOP
    UPDATE public.opportunity_posts
    SET
      status = 'published',
      published_at = COALESCE(published_at, now_ts),
      updated_at = now_ts
    WHERE id = r.id;

    INSERT INTO public.opportunity_post_history (post_id, event_type, detail_json, created_at)
    VALUES (
      r.id,
      'auto_published',
      (jsonb_build_object('at', now_ts))::text,
      now_ts
    );
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.process_due_scheduled_opportunity_posts () FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_due_scheduled_opportunity_posts () TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.site_search_public (p_query text, p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  q text := trim(coalesce(p_query, ''));
  cap integer := least(50, greatest(1, coalesce(p_limit, 20)));
  per_bucket integer := greatest(5, ceil(cap::numeric / 2));
  parts jsonb;
BEGIN
  IF length(q) = 0 THEN
    RETURN jsonb_build_object('query', '', 'results', '[]'::jsonb);
  END IF;
  IF length(q) > 200 THEN
    RAISE EXCEPTION 'QUERY_TOO_LONG' USING errcode = 'P0001';
  END IF;

  WITH real_hits AS (
    SELECT jsonb_build_object(
      'type', 'realisation',
      'id', id,
      'title', title,
      'excerpt', left(regexp_replace(description, '\s+', ' ', 'g'), 160),
      'href', '/nos-realisations',
      'meta', category
    ) AS j
    FROM public.realisations
    WHERE published = true
      AND (
        title ILIKE '%' || q || '%'
        OR description ILIKE '%' || q || '%'
        OR category ILIKE '%' || q || '%'
      )
    ORDER BY sort_order ASC, id ASC
    LIMIT per_bucket
  ),
  opp_hits AS (
    SELECT jsonb_build_object(
      'type', 'opportunity_post',
      'id', id,
      'title', title,
      'excerpt', left(
        regexp_replace(
          coalesce(nullif(trim(summary), ''), body),
          '\s+', ' ', 'g'
        ),
        160
      ),
      'href', '/opportunite/' || id::text,
      'meta', replace(category, '-', ' ')
    ) AS j
    FROM public.opportunity_posts
    WHERE status = 'published'
      AND (
        title ILIKE '%' || q || '%'
        OR coalesce(summary, '') ILIKE '%' || q || '%'
        OR body ILIKE '%' || q || '%'
        OR coalesce(organisme, '') ILIKE '%' || q || '%'
        OR coalesce(lieu, '') ILIKE '%' || q || '%'
      )
    ORDER BY coalesce(published_at, updated_at) DESC, id DESC
    LIMIT per_bucket
  ),
  exp_hits AS (
    SELECT jsonb_build_object(
      'type', 'expertise',
      'id', sp.slug,
      'title',
      coalesce(
        nullif(trim(coalesce(sp.jb ->> 'title', '')), ''),
        initcap(replace(sp.slug, '-', ' '))
      ),
      'excerpt', left(
        regexp_replace(
          coalesce(
            nullif(trim(coalesce(sp.jb ->> 'subtitle', '')), ''),
            nullif(trim(coalesce(sp.jb ->> 'description', '')), ''),
            nullif(trim(coalesce(sp.jb ->> 'fullDescription', '')), ''),
            ''
          ),
          '\s+', ' ', 'g'
        ),
        160
      ),
      'href', '/expertises/' || sp.slug,
      'meta', 'Expertise'
    ) AS j
    FROM (
      SELECT
        slug,
        sort_order,
        published,
        content_json,
        CASE
          WHEN content_json IS NULL OR btrim(content_json) = '' THEN '{}'::jsonb
          WHEN content_json ~ '^\s*[\[{]' THEN content_json::jsonb
          ELSE '{}'::jsonb
        END AS jb
      FROM public.service_publications
    ) sp
    WHERE sp.published = true
      AND (
        sp.slug ILIKE '%' || q || '%'
        OR coalesce(sp.content_json, '') ILIKE '%' || q || '%'
      )
    ORDER BY sp.sort_order ASC, sp.slug ASC
    LIMIT per_bucket
  ),
  combined AS (
    SELECT j FROM real_hits
    UNION ALL
    SELECT j FROM opp_hits
    UNION ALL
    SELECT j FROM exp_hits
  )
  SELECT coalesce(jsonb_agg(j), '[]'::jsonb) FROM (SELECT j FROM combined LIMIT cap) s
  INTO parts;

  RETURN jsonb_build_object('query', q, 'results', coalesce(parts, '[]'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.site_search_public (text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.site_search_public (text, integer) TO anon, authenticated;

-- --- RLS --------------------------------------------------------------------

ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_feed_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY realisations_select_anon ON public.realisations
  FOR SELECT TO anon USING (published = true);

CREATE POLICY realisations_all_authenticated ON public.realisations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY service_publications_select_anon ON public.service_publications
  FOR SELECT TO anon USING (true);

CREATE POLICY service_publications_all_authenticated ON public.service_publications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY site_settings_select_anon ON public.site_settings
  FOR SELECT TO anon USING (true);

CREATE POLICY site_settings_all_authenticated ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY opportunity_posts_select_anon ON public.opportunity_posts
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY opportunity_posts_all_authenticated ON public.opportunity_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY opportunity_history_all_authenticated ON public.opportunity_post_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY opportunity_subscribers_insert_anon ON public.opportunity_feed_subscribers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY opportunity_subscribers_all_authenticated ON public.opportunity_feed_subscribers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- --- Storage (images / documents admin) -------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-media', 'admin-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY storage_admin_media_select ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'admin-media');

CREATE POLICY storage_admin_media_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'admin-media');

CREATE POLICY storage_admin_media_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'admin-media')
  WITH CHECK (bucket_id = 'admin-media');

CREATE POLICY storage_admin_media_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'admin-media');

-- --- Droits API (anon / authenticated) --------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.realisations TO anon;
GRANT SELECT ON public.service_publications TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.opportunity_posts TO anon;
GRANT INSERT ON public.opportunity_feed_subscribers TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.realisations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_publications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_post_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_feed_subscribers TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
