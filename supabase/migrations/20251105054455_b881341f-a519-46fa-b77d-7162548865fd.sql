-- Add images column to damage_reports table
ALTER TABLE public.damage_reports
ADD COLUMN images text[] DEFAULT ARRAY[]::text[];