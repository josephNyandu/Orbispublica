-- Refonte des services : 4 expertises (conformité, commande publique, ingénierie de projets, formation)
DELETE FROM public.service_publications
WHERE slug IN ('marches-publics','projets','financements-subventions','gouvernance-structuration','optimisation-fiscale','audit-conformite','contentieux-publics','formation-recherche');

INSERT INTO public.service_publications (slug, published, sort_order, updated_at)
VALUES
  ('conformite', true, 0, now()),
  ('commande-publique', true, 1, now()),
  ('ingenierie-projets', true, 2, now()),
  ('formation-sensibilisation-recherche', true, 3, now())
ON CONFLICT (slug) DO NOTHING;
