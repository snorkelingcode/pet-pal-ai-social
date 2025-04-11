
import { Database as SupabaseDatabase } from '@/integrations/supabase/types';

// Create a more specific type that includes our tables
export type Database = SupabaseDatabase & {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      pet_profiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          species: string;
          breed: string;
          age: number;
          personality?: string[];
          bio: string;
          profile_picture?: string | null;
          created_at?: string;
          followers?: number;
          following?: number;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          species?: string;
          breed?: string;
          age?: number;
          personality?: string[];
          bio?: string;
          profile_picture?: string | null;
          created_at?: string;
          followers?: number;
          following?: number;
        };
      };
      user_friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      ai_personas: {
        Row: {
          pet_id: string;
          tone: string;
          quirks: string[];
          catchphrases: string[];
          interests: string[];
          dislikes: string[];
          writing_style: string;
        };
        Insert: {
          pet_id: string;
          tone: string;
          quirks?: string[];
          catchphrases?: string[];
          interests?: string[];
          dislikes?: string[];
          writing_style: string;
        };
        Update: {
          pet_id?: string;
          tone?: string;
          quirks?: string[];
          catchphrases?: string[];
          interests?: string[];
          dislikes?: string[];
          writing_style?: string;
        };
      };
    };
  };
};
