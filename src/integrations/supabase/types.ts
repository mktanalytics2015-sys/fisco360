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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounting_providers: {
        Row: {
          address: string | null
          cedula_number: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          is_featured: boolean
          is_premium: boolean
          is_verified: boolean
          languages: string[] | null
          logo_url: string | null
          name: string
          nif: string | null
          owner_id: string
          phone: string | null
          price_range_max: number | null
          price_range_min: number | null
          province: string | null
          rating_avg: number
          rating_count: number
          services: Json | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["provider_status"]
          type: Database["public"]["Enums"]["provider_type"]
          updated_at: string
          website: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          cedula_number?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          is_verified?: boolean
          languages?: string[] | null
          logo_url?: string | null
          name: string
          nif?: string | null
          owner_id: string
          phone?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          province?: string | null
          rating_avg?: number
          rating_count?: number
          services?: Json | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["provider_status"]
          type?: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          cedula_number?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          is_verified?: boolean
          languages?: string[] | null
          logo_url?: string | null
          name?: string
          nif?: string | null
          owner_id?: string
          phone?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          province?: string | null
          rating_avg?: number
          rating_count?: number
          services?: Json | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["provider_status"]
          type?: Database["public"]["Enums"]["provider_type"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          simulations_reset_at: string
          simulations_this_month: number
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          simulations_reset_at?: string
          simulations_this_month?: number
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          simulations_reset_at?: string
          simulations_this_month?: number
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "accounting_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "public_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget_estimate: number | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          provider_id: string | null
          requester_id: string | null
          service_needed: string
          status: Database["public"]["Enums"]["quote_status"]
        }
        Insert: {
          budget_estimate?: number | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          provider_id?: string | null
          requester_id?: string | null
          service_needed: string
          status?: Database["public"]["Enums"]["quote_status"]
        }
        Update: {
          budget_estimate?: number | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          provider_id?: string | null
          requester_id?: string | null
          service_needed?: string
          status?: Database["public"]["Enums"]["quote_status"]
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "accounting_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "public_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_providers: {
        Row: {
          address: string | null
          cedula_number: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_featured: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          logo_url: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          price_range_max: number | null
          price_range_min: number | null
          province: string | null
          rating_avg: number | null
          rating_count: number | null
          services: Json | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["provider_status"] | null
          type: Database["public"]["Enums"]["provider_type"] | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          cedula_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          province?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          services?: Json | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          type?: Database["public"]["Enums"]["provider_type"] | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          cedula_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          province?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          services?: Json | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          type?: Database["public"]["Enums"]["provider_type"] | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      provider_status: "pending" | "approved" | "rejected"
      provider_type: "company" | "individual"
      quote_status: "pending" | "responded" | "closed"
      subscription_status: "free" | "premium" | "cancelled"
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
      app_role: ["admin", "user"],
      provider_status: ["pending", "approved", "rejected"],
      provider_type: ["company", "individual"],
      quote_status: ["pending", "responded", "closed"],
      subscription_status: ["free", "premium", "cancelled"],
    },
  },
} as const
