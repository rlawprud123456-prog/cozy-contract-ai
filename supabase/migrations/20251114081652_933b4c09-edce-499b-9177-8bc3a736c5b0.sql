-- Create featured_history table to track partner featuring history
CREATE TABLE public.featured_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  featured_at timestamp with time zone NOT NULL DEFAULT now(),
  unfeatured_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all history
CREATE POLICY "Admins can view featured history"
ON public.featured_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can manage history
CREATE POLICY "Admins can manage featured history"
ON public.featured_history
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX idx_featured_history_partner ON public.featured_history(partner_id);
CREATE INDEX idx_featured_history_dates ON public.featured_history(featured_at DESC);