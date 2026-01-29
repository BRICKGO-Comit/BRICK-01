-- IMPORTANT : Exécutez ce script dans l'éditeur SQL de Supabase
-- Ajout de la colonne pour le lien Google Maps

ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS google_map_link text;

-- Vérification des permissions
GRANT ALL ON public.prospects TO authenticated;
GRANT ALL ON public.prospects TO service_role;
