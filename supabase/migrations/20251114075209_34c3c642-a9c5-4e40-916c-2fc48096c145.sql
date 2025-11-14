-- Add featured column to partners table
ALTER TABLE public.partners 
ADD COLUMN featured boolean DEFAULT false,
ADD COLUMN featured_at timestamp with time zone;

-- Create index for featured partners query
CREATE INDEX idx_partners_featured ON public.partners(featured) WHERE featured = true;