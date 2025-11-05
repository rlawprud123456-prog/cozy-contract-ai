import { supabase as supabaseClient } from "@/integrations/supabase/client";

export const supabase = supabaseClient;

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  };
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  images: string[] | null;
  view_count: number | null;
  like_count: number | null;
  created_at: string;
  updated_at: string;
  partner_id?: string | null;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
