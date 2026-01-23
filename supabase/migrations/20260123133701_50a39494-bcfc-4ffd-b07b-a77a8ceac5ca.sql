-- Add status column to damage_reports table for tracking report resolution
ALTER TABLE public.damage_reports 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add comment for clarity
COMMENT ON COLUMN public.damage_reports.status IS 'Report status: pending, in_progress, fixed, rejected';