-- Add comments column to prospects table
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS comments TEXT;
