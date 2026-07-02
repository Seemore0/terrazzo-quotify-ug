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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          archived: boolean
          created_at: string
          email: string | null
          id: string
          last_project_date: string | null
          location: string | null
          name: string
          notes: string | null
          owner_id: string
          phone: string
          total_projects: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          email?: string | null
          id?: string
          last_project_date?: string | null
          location?: string | null
          name: string
          notes?: string | null
          owner_id: string
          phone: string
          total_projects?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          email?: string | null
          id?: string
          last_project_date?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string
          total_projects?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          item_key: string
          item_type: string
          new_value: number | null
          old_value: number | null
          preset_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_key: string
          item_type: string
          new_value?: number | null
          old_value?: number | null
          preset_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_key?: string
          item_type?: string
          new_value?: number | null
          old_value?: number | null
          preset_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "pricing_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_presets: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_public: boolean
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          area_m2: number
          created_at: string
          customer_id: string | null
          customer_location: string | null
          customer_name: string
          customer_phone: string
          id: string
          materials: Json | null
          notes: string | null
          owner_id: string
          pattern_id: string | null
          pdf_url: string | null
          preset_id: string | null
          profit: number
          quote_number: string
          rate_per_m2: number | null
          status: Database["public"]["Enums"]["quote_status"]
          style_id: string | null
          subtotal: number
          total_cost: number
          updated_at: string
          work_mode: string
        }
        Insert: {
          area_m2: number
          created_at?: string
          customer_id?: string | null
          customer_location?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          materials?: Json | null
          notes?: string | null
          owner_id: string
          pattern_id?: string | null
          pdf_url?: string | null
          preset_id?: string | null
          profit?: number
          quote_number: string
          rate_per_m2?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          style_id?: string | null
          subtotal?: number
          total_cost?: number
          updated_at?: string
          work_mode: string
        }
        Update: {
          area_m2?: number
          created_at?: string
          customer_id?: string | null
          customer_location?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          materials?: Json | null
          notes?: string | null
          owner_id?: string
          pattern_id?: string | null
          pdf_url?: string | null
          preset_id?: string | null
          profit?: number
          quote_number?: string
          rate_per_m2?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          style_id?: string | null
          subtotal?: number
          total_cost?: number
          updated_at?: string
          work_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "pricing_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_counters: {
        Row: {
          last_seq: number
          year: number
        }
        Insert: {
          last_seq?: number
          year: number
        }
        Update: {
          last_seq?: number
          year?: number
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_quote_number: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
      quote_status:
        | "draft"
        | "sent"
        | "approved"
        | "rejected"
        | "in_progress"
        | "completed"
        | "archived"
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
      quote_status: [
        "draft",
        "sent",
        "approved",
        "rejected",
        "in_progress",
        "completed",
        "archived",
      ],
    },
  },
} as const
