-- Fix profiles table to match application logic
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Drop full_name if it is not used, or keep it. Let's keep it for compatibility but we are moving to first/last.
