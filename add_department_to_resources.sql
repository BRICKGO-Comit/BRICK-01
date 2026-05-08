-- Migration to add department filtering to services and contents
-- This enables strict partitioning of resources by department.

BEGIN;

-- 1. Update Services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'all';

-- Update existing services to 'brick_core' if they were generic
UPDATE public.services SET department = 'brick_core' WHERE department = 'all';
-- Set the default back to 'all' for new entries if needed, or keep it specific
ALTER TABLE public.services ALTER COLUMN department SET DEFAULT 'all';

-- 2. Update Contents table (Formations & Vidéos)
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'all';

-- Update existing contents to 'brick_core'
UPDATE public.contents SET department = 'brick_core' WHERE department = 'all';
ALTER TABLE public.contents ALTER COLUMN department SET DEFAULT 'all';

-- 3. Update RLS Policies to enforce department filtering
-- Note: This assumes users can only see resources from their own department OR 'all'

-- Services Policy Update
DROP POLICY IF EXISTS "Services are viewable by everyone." ON public.services;
CREATE POLICY "Services are viewable by department" ON public.services
    FOR SELECT USING (
        department = 'all' OR 
        department = (SELECT department FROM public.profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Contents Policy Update
DROP POLICY IF EXISTS "Contents are viewable by everyone." ON public.contents;
CREATE POLICY "Contents are viewable by department" ON public.contents
    FOR SELECT USING (
        department = 'all' OR 
        department = (SELECT department FROM public.profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

COMMIT;
