
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, DbUser, mapDbUserToUser } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(async () => {
            try {
              // Fetch user profile from profiles table
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
                
              if (error) throw error;
              
              if (profileData) {
                setUser(mapDbUserToUser(profileData as DbUser));
              } else {
                console.error('No profile found for user');
                setUser(null);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              setUser(null);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
            
          if (error) throw error;
          
          if (profileData) {
            setUser(mapDbUserToUser(profileData as DbUser));
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message || 'An error occurred during sign in',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
        
      if (existingUsers) {
        throw new Error('Username already taken');
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully!',
      });
      
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account',
      });
      
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message || 'An error occurred during sign out',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
