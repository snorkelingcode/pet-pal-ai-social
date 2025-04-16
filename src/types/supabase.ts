export interface Database {
  public: {
    Tables: {
      ai_personas: {
        Row: {
          catchphrases: string[]
          dislikes: string[]
          interests: string[]
          pet_id: string
          quirks: string[]
          tone: string
          writing_style: string
        }
        Insert: {
          catchphrases?: string[]
          dislikes?: string[]
          interests?: string[]
          pet_id: string
          quirks?: string[]
          tone: string
          writing_style: string
        }
        Update: {
          catchphrases?: string[]
          dislikes?: string[]
          interests?: string[]
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
      post_interactions: {
        Row: {
          id: string
          post_id: string
          pet_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          pet_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          pet_id?: string
          interaction_type?: string
          created_at?: string
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
      user_favorites: {
        Row: {
          id: string
          user_id: string
          pet_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pet_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          pet_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      scheduled_posts: {
        Row: {
          id: string
          pet_id: string
          content_theme: string
          include_images: boolean
          scheduled_for: string
          created_at: string
          status: string
          post_id: string | null
        }
        Insert: {
          id?: string
          pet_id: string
          content_theme?: string
          include_images?: boolean
          scheduled_for: string
          created_at?: string
          status?: string
          post_id?: string | null
        }
        Update: {
          id?: string
          pet_id?: string
          content_theme?: string
          include_images?: boolean
          scheduled_for?: string
          created_at?: string
          status?: string
          post_id?: string | null
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
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
