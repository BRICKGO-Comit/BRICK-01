-- IMPORTANT : Exécutez ce script dans l'éditeur SQL de Supabase (Tableau de bord -> SQL Editor)
-- Cela va ajouter les colonnes manquantes pour stocker toutes les infos du formulaire mobile.

-- 1. Ajout de la colonne pour les commentaires
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS comments text;

-- 2. Ajout de la colonne pour l'adresse
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS address text;

-- 3. Ajout de la colonne pour la valeur du deal (revenu, optionnel pour l'instant)
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS deal_value numeric DEFAULT 0;

-- 4. Vérification des permissions
GRANT ALL ON public.prospects TO authenticated;
GRANT ALL ON public.prospects TO service_role;
