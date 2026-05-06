-- Migration for Brick Food Department
-- Ce script ajoute les colonnes nécessaires pour gérer le département Brick Food
-- et les objectifs commerciaux.

BEGIN;

-- 1. Mise à jour de la table Profiles (Commerciaux)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'brick_core',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS assigned_zone TEXT,
ADD COLUMN IF NOT EXISTS monthly_prospects_goal INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS monthly_inscriptions_goal INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS monthly_subscriptions_goal INTEGER DEFAULT 10;

-- 2. Mise à jour de la table Prospects (Établissements)
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'brick_core',
ADD COLUMN IF NOT EXISTS manager_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS gps_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS gps_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS establishment_type TEXT, -- Restaurant, Fast-food, etc.
ADD COLUMN IF NOT EXISTS photo_exterior TEXT,
ADD COLUMN IF NOT EXISTS photo_interior TEXT,
ADD COLUMN IF NOT EXISTS photo_menu TEXT,
ADD COLUMN IF NOT EXISTS photo_kitchen TEXT,
ADD COLUMN IF NOT EXISTS photo_terrace TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT, -- 3 mois, 6 mois, Annuel
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0;

-- Mise à jour des statuts autorisés
-- Nouveaux statuts : demo_done, free_test_active, waiting, refused
ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_check;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_status_check 
CHECK (status IN ('new', 'contacted', 'demo_done', 'free_test_active', 'waiting', 'converted', 'refused', 'lost'));

-- 3. Création des permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.prospects TO authenticated;

COMMIT;
