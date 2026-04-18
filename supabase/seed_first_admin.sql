-- Remplacez <USER_UUID> par l’UUID du compte (Supabase Dashboard → Authentication → Users → colonne UID).
-- Exécuter dans le SQL Editor avec le rôle postgres (ou service role).

INSERT INTO public.site_admins (user_id)
VALUES ('<USER_UUID>')
ON CONFLICT (user_id) DO NOTHING;
