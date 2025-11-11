-- Add rejection_reason column to estimate_requests table
ALTER TABLE public.estimate_requests 
ADD COLUMN rejection_reason text;