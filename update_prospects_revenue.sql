-- Add deal_value column to prospects for revenue calculation
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS deal_value NUMERIC DEFAULT 0;
