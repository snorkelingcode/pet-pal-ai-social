export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  handle: string;
}

export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  personality: string[];
  bio: string;
  profilePicture?: string;
  createdAt: string;
  followers: number;
  following: number;
  handle: string;
  profile_url: string;
}

export interface Post {
  id: string;
  petId: string;
  petProfile: PetProfile;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  petId?: string;
  userId?: string;
  authorName?: string;
  authorHandle?: string;
  content: string;
  likes: number;
  createdAt: string;
  petProfile?: PetProfile;
  userProfile?: {
    id: string;
    username: string;
    avatarUrl?: string;
    handle: string;
  };
  hasLiked?: boolean;
}

export interface CommentLike {
  id: string;
  commentId: string;
  petId?: string;
  userId?: string;
  createdAt: string;
}

export interface AIPersona {
  petId: string;
  tone: string;
  quirks: string[];
  catchphrases: string[];
  interests: string[];
  dislikes: string[];
  writingStyle: string;
}

export interface DbUser {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  handle: string;
}

export interface DbPetProfile {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  personality: string[];
  bio: string;
  profile_picture: string | null;
  created_at: string;
  followers: number;
  following: number;
  handle: string;
  profile_url: string;
}

export interface DbPost {
  id: string;
  pet_id: string;
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  created_at: string;
}

export interface DbComment {
  id: string;
  post_id: string;
  pet_id: string | null;
  user_id: string | null;
  content: string;
  author_name: string | null;
  author_handle: string | null;
  likes: number;
  created_at: string;
}

export interface DbAIPersona {
  pet_id: string;
  tone: string;
  quirks: string[];
  catchphrases: string[];
  interests: string[];
  dislikes: string[];
  writing_style: string;
}

export interface DbCommentLike {
  id: string;
  comment_id: string;
  pet_id: string | null;
  user_id: string | null;
  created_at: string;
}

export const mapDbUserToUser = (dbUser: DbUser): User => ({
  id: dbUser.id,
  username: dbUser.username,
  email: dbUser.email,
  createdAt: dbUser.created_at,
  bio: dbUser.bio || undefined,
  avatarUrl: dbUser.avatar_url || undefined,
  handle: dbUser.handle,
});

export const mapDbPetProfileToPetProfile = (dbPetProfile: DbPetProfile): PetProfile => ({
  id: dbPetProfile.id,
  ownerId: dbPetProfile.owner_id,
  name: dbPetProfile.name,
  species: dbPetProfile.species,
  breed: dbPetProfile.breed,
  age: dbPetProfile.age,
  personality: dbPetProfile.personality,
  bio: dbPetProfile.bio,
  profilePicture: dbPetProfile.profile_picture || undefined,
  createdAt: dbPetProfile.created_at,
  followers: dbPetProfile.followers,
  following: dbPetProfile.following,
  handle: dbPetProfile.handle,
  profile_url: dbPetProfile.profile_url,
});

export const mapDbAIPersonaToAIPersona = (dbAIPersona: DbAIPersona): AIPersona => ({
  petId: dbAIPersona.pet_id,
  tone: dbAIPersona.tone,
  quirks: dbAIPersona.quirks,
  catchphrases: dbAIPersona.catchphrases,
  interests: dbAIPersona.interests,
  dislikes: dbAIPersona.dislikes,
  writingStyle: dbAIPersona.writing_style,
});

export const mapDbCommentToComment = (dbComment: DbComment): Comment => ({
  id: dbComment.id,
  postId: dbComment.post_id,
  petId: dbComment.pet_id || undefined,
  userId: dbComment.user_id || undefined,
  authorName: dbComment.author_name || undefined,
  authorHandle: dbComment.author_handle || undefined,
  content: dbComment.content,
  likes: dbComment.likes,
  createdAt: dbComment.created_at,
});

export const mapDbCommentLikeToCommentLike = (dbCommentLike: DbCommentLike): CommentLike => ({
  id: dbCommentLike.id,
  commentId: dbCommentLike.comment_id,
  petId: dbCommentLike.pet_id || undefined,
  userId: dbCommentLike.user_id || undefined,
  createdAt: dbCommentLike.created_at,
});

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  execution_id: string | null;
  status: string;
  execution_data: any;
  started_at: string;
  completed_at: string | null;
  error: string | null;
  pet_id: string | null;
  post_id: string | null;
  scheduled_post_id: string | null;
}

// Update the Database interface to include our new table
export interface Database {
  public: {
    Tables: {
      n8n_workflow_executions: {
        Row: WorkflowExecution;
        Insert: Omit<WorkflowExecution, 'id'> & { id?: string };
        Update: Partial<WorkflowExecution>;
      };
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
          rapid_posting: boolean
          handle: string
          profile_url: string
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
          rapid_posting?: boolean
          handle: string
          profile_url: string
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
          rapid_posting?: boolean
          handle?: string
          profile_url?: string
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
