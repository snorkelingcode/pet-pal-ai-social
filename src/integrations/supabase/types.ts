export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_personas: {
        Row: {
          adaptive_preferences: Json | null
          catchphrases: string[]
          dislikes: string[]
          interests: string[]
          learning_rate: number | null
          personality_evolution: Json | null
          pet_id: string
          quirks: string[]
          tone: string
          writing_style: string
        }
        Insert: {
          adaptive_preferences?: Json | null
          catchphrases?: string[]
          dislikes?: string[]
          interests?: string[]
          learning_rate?: number | null
          personality_evolution?: Json | null
          pet_id: string
          quirks?: string[]
          tone: string
          writing_style: string
        }
        Update: {
          adaptive_preferences?: Json | null
          catchphrases?: string[]
          dislikes?: string[]
          interests?: string[]
          learning_rate?: number | null
          personality_evolution?: Json | null
          pet_id?: string
          quirks?: string[]
          tone?: string
          writing_style?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_personas_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_service_status: {
        Row: {
          failure_count: number | null
          is_available: boolean | null
          last_failure: string | null
          last_success: string | null
          reset_after: unknown | null
          service_name: string
        }
        Insert: {
          failure_count?: number | null
          is_available?: boolean | null
          last_failure?: string | null
          last_success?: string | null
          reset_after?: unknown | null
          service_name: string
        }
        Update: {
          failure_count?: number | null
          is_available?: boolean | null
          last_failure?: string | null
          last_success?: string | null
          reset_after?: unknown | null
          service_name?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          pet_id: string | null
          user_id: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          pet_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          pet_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_handle: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          likes: number
          pet_id: string | null
          post_id: string
          user_id: string | null
        }
        Insert: {
          author_handle?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          likes?: number
          pet_id?: string | null
          post_id: string
          user_id?: string | null
        }
        Update: {
          author_handle?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          likes?: number
          pet_id?: string | null
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_workflow_executions: {
        Row: {
          action_type:
            | Database["public"]["Enums"]["workflow_action_type"]
            | null
          completed_at: string | null
          error: string | null
          execution_data: Json | null
          execution_id: string | null
          id: string
          pet_id: string | null
          post_id: string | null
          scheduled_post_id: string | null
          started_at: string
          status: string
          webhook_url: string | null
          workflow_id: string
          workflow_name: string
        }
        Insert: {
          action_type?:
            | Database["public"]["Enums"]["workflow_action_type"]
            | null
          completed_at?: string | null
          error?: string | null
          execution_data?: Json | null
          execution_id?: string | null
          id?: string
          pet_id?: string | null
          post_id?: string | null
          scheduled_post_id?: string | null
          started_at?: string
          status?: string
          webhook_url?: string | null
          workflow_id: string
          workflow_name: string
        }
        Update: {
          action_type?:
            | Database["public"]["Enums"]["workflow_action_type"]
            | null
          completed_at?: string | null
          error?: string | null
          execution_data?: Json | null
          execution_id?: string | null
          id?: string
          pet_id?: string | null
          post_id?: string | null
          scheduled_post_id?: string | null
          started_at?: string
          status?: string
          webhook_url?: string | null
          workflow_id?: string
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "n8n_workflow_executions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_workflow_executions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_workflow_executions_scheduled_post_id_fkey"
            columns: ["scheduled_post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_knowledge: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          knowledge_type: string
          pet_id: string
          relevance: number | null
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          knowledge_type: string
          pet_id: string
          relevance?: number | null
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          knowledge_type?: string
          pet_id?: string
          relevance?: number | null
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_knowledge_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_memories: {
        Row: {
          access_count: number | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          importance: number
          last_accessed_at: string | null
          memory_type: string
          pet_id: string
          related_pet_id: string | null
          related_post_id: string | null
          sentiment: number | null
        }
        Insert: {
          access_count?: number | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_type: string
          pet_id: string
          related_pet_id?: string | null
          related_post_id?: string | null
          sentiment?: number | null
        }
        Update: {
          access_count?: number | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_type?: string
          pet_id?: string
          related_pet_id?: string | null
          related_post_id?: string | null
          sentiment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_memories_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_memories_related_pet_id_fkey"
            columns: ["related_pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_memories_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_profiles: {
        Row: {
          age: number
          bio: string
          breed: string
          created_at: string
          followers: number
          following: number
          handle: string
          id: string
          n8n_webhook_url: string | null
          name: string
          owner_id: string
          personality: string[]
          profile_picture: string | null
          profile_url: string
          rapid_posting: boolean | null
          species: string
        }
        Insert: {
          age: number
          bio: string
          breed: string
          created_at?: string
          followers?: number
          following?: number
          handle: string
          id?: string
          n8n_webhook_url?: string | null
          name: string
          owner_id: string
          personality?: string[]
          profile_picture?: string | null
          profile_url?: string
          rapid_posting?: boolean | null
          species: string
        }
        Update: {
          age?: number
          bio?: string
          breed?: string
          created_at?: string
          followers?: number
          following?: number
          handle?: string
          id?: string
          n8n_webhook_url?: string | null
          name?: string
          owner_id?: string
          personality?: string[]
          profile_picture?: string | null
          profile_url?: string
          rapid_posting?: boolean | null
          species?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_relationships: {
        Row: {
          created_at: string | null
          familiarity: number
          id: string
          interaction_history: Json | null
          last_interaction_at: string | null
          pet_id: string
          related_pet_id: string
          relationship_type: string
          sentiment: number | null
        }
        Insert: {
          created_at?: string | null
          familiarity?: number
          id?: string
          interaction_history?: Json | null
          last_interaction_at?: string | null
          pet_id: string
          related_pet_id: string
          relationship_type: string
          sentiment?: number | null
        }
        Update: {
          created_at?: string | null
          familiarity?: number
          id?: string
          interaction_history?: Json | null
          last_interaction_at?: string | null
          pet_id?: string
          related_pet_id?: string
          relationship_type?: string
          sentiment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_relationships_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_relationships_related_pet_id_fkey"
            columns: ["related_pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          pet_id: string | null
          post_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          pet_id?: string | null
          post_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          pet_id?: string | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments: number
          content: string
          created_at: string
          id: string
          image: string | null
          likes: number
          pet_id: string
        }
        Insert: {
          comments?: number
          content: string
          created_at?: string
          id?: string
          image?: string | null
          likes?: number
          pet_id: string
        }
        Update: {
          comments?: number
          content?: string
          created_at?: string
          id?: string
          image?: string | null
          likes?: number
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          handle: string
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          handle: string
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          handle?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          content_theme: string
          created_at: string
          id: string
          include_images: boolean
          pet_id: string
          post_id: string | null
          scheduled_for: string
          status: string
          voice_example: string | null
        }
        Insert: {
          content_theme?: string
          created_at?: string
          id?: string
          include_images?: boolean
          pet_id: string
          post_id?: string | null
          scheduled_for: string
          status?: string
          voice_example?: string | null
        }
        Update: {
          content_theme?: string
          created_at?: string
          id?: string
          include_images?: boolean
          pet_id?: string
          post_id?: string | null
          scheduled_for?: string
          status?: string
          voice_example?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          pet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pet_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_pet_memories: {
        Args: { p_pet_id: string }
        Returns: {
          access_count: number | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          importance: number
          last_accessed_at: string | null
          memory_type: string
          pet_id: string
          related_pet_id: string | null
          related_post_id: string | null
          sentiment: number | null
        }[]
      }
      get_pet_workflows: {
        Args: { p_pet_id: string }
        Returns: {
          action_type:
            | Database["public"]["Enums"]["workflow_action_type"]
            | null
          completed_at: string | null
          error: string | null
          execution_data: Json | null
          execution_id: string | null
          id: string
          pet_id: string | null
          post_id: string | null
          scheduled_post_id: string | null
          started_at: string
          status: string
          webhook_url: string | null
          workflow_id: string
          workflow_name: string
        }[]
      }
      get_recent_workflows: {
        Args: { limit_count?: number }
        Returns: {
          action_type:
            | Database["public"]["Enums"]["workflow_action_type"]
            | null
          completed_at: string | null
          error: string | null
          execution_data: Json | null
          execution_id: string | null
          id: string
          pet_id: string | null
          post_id: string | null
          scheduled_post_id: string | null
          started_at: string
          status: string
          webhook_url: string | null
          workflow_id: string
          workflow_name: string
        }[]
      }
      get_workflow_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total: number
          completed: number
          failed: number
          pending: number
          success_rate: number
        }[]
      }
      get_workflow_status: {
        Args: { p_workflow_id: string; p_execution_id: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_ai_service_available: {
        Args: { service_name: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_memories: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          pet_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
      }
      process_rapid_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      process_scheduled_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      record_ai_service_failure: {
        Args: { service_name: string }
        Returns: undefined
      }
      record_ai_service_success: {
        Args: { service_name: string }
        Returns: undefined
      }
      retry_n8n_workflow: {
        Args: { p_workflow_id: string; p_execution_id: string }
        Returns: boolean
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      start_n8n_workflow: {
        Args: {
          workflow_id: string
          workflow_name: string
          webhook_url: string
          payload: Json
          pet_id: string
          action_type?: Database["public"]["Enums"]["workflow_action_type"]
        }
        Returns: string
      }
      trigger_n8n_rapid_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_pet_webhook_url: {
        Args: { p_pet_id: string; p_webhook_url: string }
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      workflow_action_type:
        | "post_creation"
        | "post_interaction"
        | "messaging"
        | "follow_unfollow"
        | "profile_update"
        | "test_integration"
        | "rapid_posting"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      workflow_action_type: [
        "post_creation",
        "post_interaction",
        "messaging",
        "follow_unfollow",
        "profile_update",
        "test_integration",
        "rapid_posting",
      ],
    },
  },
} as const
