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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number
          pet_id: string
          post_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number
          pet_id: string
          post_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number
          pet_id?: string
          post_id?: string
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
          id: string
          name: string
          owner_id: string
          personality: string[]
          profile_picture: string | null
          species: string
        }
        Insert: {
          age: number
          bio: string
          breed: string
          created_at?: string
          followers?: number
          following?: number
          id?: string
          name: string
          owner_id: string
          personality?: string[]
          profile_picture?: string | null
          species: string
        }
        Update: {
          age?: number
          bio?: string
          breed?: string
          created_at?: string
          followers?: number
          following?: number
          id?: string
          name?: string
          owner_id?: string
          personality?: string[]
          profile_picture?: string | null
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
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
