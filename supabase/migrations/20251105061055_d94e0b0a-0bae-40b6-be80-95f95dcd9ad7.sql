-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.community_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
$$;