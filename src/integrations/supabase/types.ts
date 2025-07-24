export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_goals: {
        Row: {
          created_at: string
          end_date: string
          goal_type: string
          id: string
          is_completed: boolean | null
          start_date: string
          target_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          goal_type: string
          id?: string
          is_completed?: boolean | null
          start_date: string
          target_value: number
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          goal_type?: string
          id?: string
          is_completed?: boolean | null
          start_date?: string
          target_value?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_ai: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_ai?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_ai?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          downloaded_at: string | null
          expires_at: string | null
          id: string
          movie_id: number
          user_id: string
        }
        Insert: {
          downloaded_at?: string | null
          expires_at?: string | null
          id?: string
          movie_id: number
          user_id: string
        }
        Update: {
          downloaded_at?: string | null
          expires_at?: string | null
          id?: string
          movie_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloads_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      highscores: {
        Row: {
          created_at: string | null
          id: string
          player_name: string | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          player_name?: string | null
          score: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          player_name?: string | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      movie_details: {
        Row: {
          created_at: string
          genres: Json | null
          id: number
          ratings: Json | null
          runtime: number | null
          status: string | null
          tagline: string | null
          updated_at: string
          videos: Json | null
        }
        Insert: {
          created_at?: string
          genres?: Json | null
          id: number
          ratings?: Json | null
          runtime?: number | null
          status?: string | null
          tagline?: string | null
          updated_at?: string
          videos?: Json | null
        }
        Update: {
          created_at?: string
          genres?: Json | null
          id?: number
          ratings?: Json | null
          runtime?: number | null
          status?: string | null
          tagline?: string | null
          updated_at?: string
          videos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "movie_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_reviews: {
        Row: {
          created_at: string | null
          id: string
          movie_id: number
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_id: number
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_id?: number
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_shares: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          movie_id: number
          shared_with: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          movie_id: number
          shared_with: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          movie_id?: number
          shared_with?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_shares_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          backdrop_path: string | null
          category: string | null
          created_at: string
          genre_ids: Json | null
          id: number
          media_type: string | null
          overview: string | null
          popularity: number | null
          poster_path: string | null
          release_date: string | null
          title: string
          vote_average: number | null
          vote_count: number | null
        }
        Insert: {
          backdrop_path?: string | null
          category?: string | null
          created_at?: string
          genre_ids?: Json | null
          id: number
          media_type?: string | null
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          release_date?: string | null
          title: string
          vote_average?: number | null
          vote_count?: number | null
        }
        Update: {
          backdrop_path?: string | null
          category?: string | null
          created_at?: string
          genre_ids?: Json | null
          id?: number
          media_type?: string | null
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          release_date?: string | null
          title?: string
          vote_average?: number | null
          vote_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          allowed_formats: string
          analytics_enabled: boolean
          cache_enabled: boolean
          cdn_url: string | null
          created_at: string
          enable_comments: boolean
          enable_downloads: boolean
          enable_ratings: boolean
          enable_registration: boolean
          id: number
          maintenance_mode: boolean
          max_file_size_mb: number
          primary_color: string
          secondary_color: string
          site_description: string | null
          site_logo_url: string | null
          site_name: string
          social_login_enabled: boolean
          updated_at: string
        }
        Insert: {
          allowed_formats?: string
          analytics_enabled?: boolean
          cache_enabled?: boolean
          cdn_url?: string | null
          created_at?: string
          enable_comments?: boolean
          enable_downloads?: boolean
          enable_ratings?: boolean
          enable_registration?: boolean
          id?: number
          maintenance_mode?: boolean
          max_file_size_mb?: number
          primary_color?: string
          secondary_color?: string
          site_description?: string | null
          site_logo_url?: string | null
          site_name?: string
          social_login_enabled?: boolean
          updated_at?: string
        }
        Update: {
          allowed_formats?: string
          analytics_enabled?: boolean
          cache_enabled?: boolean
          cdn_url?: string | null
          created_at?: string
          enable_comments?: boolean
          enable_downloads?: boolean
          enable_ratings?: boolean
          enable_registration?: boolean
          id?: number
          maintenance_mode?: boolean
          max_file_size_mb?: number
          primary_color?: string
          secondary_color?: string
          site_description?: string | null
          site_logo_url?: string | null
          site_name?: string
          social_login_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      uploaded_movies: {
        Row: {
          backdrop_file_size: number | null
          backdrop_url: string | null
          budget: number | null
          cast_members: string[] | null
          country: string | null
          created_at: string | null
          director: string | null
          duration: number | null
          genre_ids: number[] | null
          id: string
          language: string | null
          media_type: string | null
          overview: string | null
          poster_file_size: number | null
          poster_url: string | null
          rating: number | null
          release_date: string | null
          revenue: number | null
          status: string | null
          title: string
          updated_at: string | null
          uploaded_by: string
          video_file_format: string | null
          video_file_size: number | null
          video_url: string
        }
        Insert: {
          backdrop_file_size?: number | null
          backdrop_url?: string | null
          budget?: number | null
          cast_members?: string[] | null
          country?: string | null
          created_at?: string | null
          director?: string | null
          duration?: number | null
          genre_ids?: number[] | null
          id?: string
          language?: string | null
          media_type?: string | null
          overview?: string | null
          poster_file_size?: number | null
          poster_url?: string | null
          rating?: number | null
          release_date?: string | null
          revenue?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          uploaded_by: string
          video_file_format?: string | null
          video_file_size?: number | null
          video_url: string
        }
        Update: {
          backdrop_file_size?: number | null
          backdrop_url?: string | null
          budget?: number | null
          cast_members?: string[] | null
          country?: string | null
          created_at?: string | null
          director?: string | null
          duration?: number | null
          genre_ids?: number[] | null
          id?: string
          language?: string | null
          media_type?: string | null
          overview?: string | null
          poster_file_size?: number | null
          poster_url?: string | null
          rating?: number | null
          release_date?: string | null
          revenue?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string
          video_file_format?: string | null
          video_file_size?: number | null
          video_url?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          calories: number | null
          created_at: string
          duration: number
          heart_rate: number | null
          id: string
          intensity: string
          notes: string | null
          steps: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          calories?: number | null
          created_at?: string
          duration: number
          heart_rate?: number | null
          id?: string
          intensity: string
          notes?: string | null
          steps?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          calories?: number | null
          created_at?: string
          duration?: number
          heart_rate?: number | null
          id?: string
          intensity?: string
          notes?: string | null
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          allow_downloads: boolean | null
          id: string
          language: string | null
          max_rating: string | null
          parental_control_enabled: boolean | null
          user_id: string
        }
        Insert: {
          allow_downloads?: boolean | null
          id?: string
          language?: string | null
          max_rating?: string | null
          parental_control_enabled?: boolean | null
          user_id: string
        }
        Update: {
          allow_downloads?: boolean | null
          id?: string
          language?: string | null
          max_rating?: string | null
          parental_control_enabled?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_shorts_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: Database["public"]["Enums"]["shorts_interaction_type"]
          movie_id: number
          user_id: string
          video_key: string
          watch_duration_seconds: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: Database["public"]["Enums"]["shorts_interaction_type"]
          movie_id: number
          user_id: string
          video_key: string
          watch_duration_seconds?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: Database["public"]["Enums"]["shorts_interaction_type"]
          movie_id?: number
          user_id?: string
          video_key?: string
          watch_duration_seconds?: number | null
        }
        Relationships: []
      }
      user_watchlist: {
        Row: {
          created_at: string | null
          id: string
          movie_id: number
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_id: number
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_id?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_watchlist_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_history: {
        Row: {
          completed: boolean | null
          id: string
          movie_id: number
          user_id: string
          watch_duration: number | null
          watched_at: string | null
        }
        Insert: {
          completed?: boolean | null
          id?: string
          movie_id: number
          user_id: string
          watch_duration?: number | null
          watched_at?: string | null
        }
        Update: {
          completed?: boolean | null
          id?: string
          movie_id?: number
          user_id?: string
          watch_duration?: number | null
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewing_history_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_list: {
        Row: {
          created_at: string | null
          id: number
          movie_title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          movie_title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          movie_title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      watch_parties: {
        Row: {
          created_at: string | null
          description: string | null
          host_id: string
          id: string
          is_public: boolean | null
          movie_id: number
          party_name: string
          scheduled_time: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          host_id: string
          id?: string
          is_public?: boolean | null
          movie_id: number
          party_name: string
          scheduled_time: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          host_id?: string
          id?: string
          is_public?: boolean | null
          movie_id?: number
          party_name?: string
          scheduled_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_parties_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_members: {
        Row: {
          id: string
          joined_at: string | null
          party_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          party_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_admin_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          role: string
          subscription: string
          join_date: string
          last_active: string
        }[]
      }
      init_highscores_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      shorts_interaction_type: "like" | "view" | "skip" | "complete"
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
      shorts_interaction_type: ["like", "view", "skip", "complete"],
    },
  },
} as const
