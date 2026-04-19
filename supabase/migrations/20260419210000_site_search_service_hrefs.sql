-- Liens recherche publique : fiches catalogue sous /services (plus /expertises/:slug)

CREATE OR REPLACE FUNCTION public.site_search_public(p_query TEXT, p_limit INTEGER DEFAULT 20)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _q TEXT;
  _pattern TEXT;
  _cap INTEGER;
  _per_bucket INTEGER;
  _results JSONB := '[]'::jsonb;
  _row RECORD;
BEGIN
  _q := trim(COALESCE(p_query, ''));
  IF _q = '' THEN
    RETURN jsonb_build_object('query', '', 'results', '[]'::jsonb);
  END IF;
  IF length(_q) > 200 THEN
    RAISE EXCEPTION 'QUERY_TOO_LONG';
  END IF;

  _cap := LEAST(50, GREATEST(1, COALESCE(p_limit, 20)));
  _per_bucket := GREATEST(5, (_cap + 1) / 2);
  _pattern := '%' || replace(replace(replace(lower(_q), '\', '\\'), '%', '\%'), '_', '\_') || '%';

  FOR _row IN
    SELECT id, title, description, category
    FROM public.realisations
    WHERE published = true
      AND (lower(title) LIKE _pattern OR lower(description) LIKE _pattern OR lower(category) LIKE _pattern)
    ORDER BY sort_order ASC, id ASC
    LIMIT _per_bucket
  LOOP
    _results := _results || jsonb_build_object(
      'type', 'realisation',
      'id', _row.id,
      'title', _row.title,
      'excerpt', left(regexp_replace(_row.description, '\s+', ' ', 'g'), 160),
      'href', '/nos-realisations',
      'meta', _row.category
    );
  END LOOP;

  FOR _row IN
    SELECT id, category, title, summary, body
    FROM public.opportunity_posts
    WHERE status = 'published'
      AND (
        lower(title) LIKE _pattern
        OR lower(COALESCE(summary, '')) LIKE _pattern
        OR lower(COALESCE(body, '')) LIKE _pattern
        OR lower(COALESCE(organisme, '')) LIKE _pattern
        OR lower(COALESCE(lieu, '')) LIKE _pattern
      )
    ORDER BY COALESCE(published_at, updated_at) DESC, id DESC
    LIMIT _per_bucket
  LOOP
    _results := _results || jsonb_build_object(
      'type', 'opportunity_post',
      'id', _row.id,
      'title', _row.title,
      'excerpt', left(regexp_replace(COALESCE(NULLIF(_row.summary, ''), _row.body, ''), '\s+', ' ', 'g'), 160),
      'href', '/opportunite/' || _row.id,
      'meta', replace(_row.category, '-', ' ')
    );
  END LOOP;

  FOR _row IN
    SELECT slug, content_json
    FROM public.service_publications
    WHERE published = true
      AND (lower(slug) LIKE _pattern OR lower(COALESCE(content_json, '')) LIKE _pattern)
    ORDER BY sort_order ASC, slug ASC
    LIMIT _per_bucket
  LOOP
    _results := _results || jsonb_build_object(
      'type', 'expertise',
      'id', _row.slug,
      'title', _row.slug,
      'excerpt', left(_row.slug, 160),
      'href', '/services/' || _row.slug,
      'meta', 'Service'
    );
  END LOOP;

  RETURN jsonb_build_object('query', _q, 'results', _results);
END;
$$;
