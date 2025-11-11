export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          images: string[] | null
          like_count: number | null
          partner_id: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          images?: string[] | null
          like_count?: number | null
          partner_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          like_count?: number | null
          partner_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          amount: number | null
          contract_file_url: string | null
          created_at: string
          deposit_amount: number | null
          description: string | null
          end_date: string | null
          final_amount: number | null
          id: string
          location: string | null
          mid_amount: number | null
          partner_id: string | null
          partner_name: string | null
          partner_phone: string | null
          pdf_url: string | null
          project_name: string | null
          start_date: string | null
          status: string
          title: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          contract_file_url?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          end_date?: string | null
          final_amount?: number | null
          id?: string
          location?: string | null
          mid_amount?: number | null
          partner_id?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          pdf_url?: string | null
          project_name?: string | null
          start_date?: string | null
          status?: string
          title: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          contract_file_url?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          end_date?: string | null
          final_amount?: number | null
          id?: string
          location?: string | null
          mid_amount?: number | null
          partner_id?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          pdf_url?: string | null
          project_name?: string | null
          start_date?: string | null
          status?: string
          title?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_reports: {
        Row: {
          amount: number | null
          business_license: string | null
          business_name: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          business_license?: string | null
          business_name: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          business_license?: string | null
          business_name?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      escrow_payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          id: string
          refunded_at: string | null
          released_at: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          id?: string
          refunded_at?: string | null
          released_at?: string | null
          status?: string
          type: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          id?: string
          refunded_at?: string | null
          released_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_requests: {
        Row: {
          area: number
          category: string
          client_name: string
          created_at: string
          description: string | null
          estimated_budget: number | null
          id: string
          images: string[] | null
          location: string
          phone: string
          project_name: string
          rejection_reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: number
          category: string
          client_name: string
          created_at?: string
          description?: string | null
          estimated_budget?: number | null
          id?: string
          images?: string[] | null
          location: string
          phone: string
          project_name: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number
          category?: string
          client_name?: string
          created_at?: string
          description?: string | null
          estimated_budget?: number | null
          id?: string
          images?: string[] | null
          location?: string
          phone?: string
          project_name?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          business_license: string | null
          business_name: string
          category: string
          created_at: string
          description: string | null
          email: string
          id: string
          phone: string
          portfolio_images: string[] | null
          status: string
          updated_at: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          business_license?: string | null
          business_name: string
          category: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          phone: string
          portfolio_images?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          business_license?: string | null
          business_name?: string
          category?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          phone?: string
          portfolio_images?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          contract_id: string | null
          created_at: string
          id: string
          images: string[] | null
          partner_id: string
          rating: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          contract_id?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          partner_id: string
          rating: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          contract_id?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          partner_id?: string
          rating?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      partner_profiles: {
        Row: {
          business_name: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          portfolio_images: string[] | null
          status: string | null
        }
        Insert: {
          business_name?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          portfolio_images?: string[] | null
          status?: string | null
        }
        Update: {
          business_name?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          portfolio_images?: string[] | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_post_liked: { Args: { p_post_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: { Args: { post_id: string }; Returns: undefined }
      set_contract_status_completed_if_all_released: {
        Args: { p_contract_id: string }
        Returns: undefined
      }
      set_contract_status_in_progress: {
        Args: { p_contract_id: string }
        Returns: undefined
      }
      toggle_post_like: { Args: { p_post_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "partner" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "partner", "user"],
    },
  },
} as const
