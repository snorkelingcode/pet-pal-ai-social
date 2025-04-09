
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication for now - would be replaced with Supabase
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - would come from Supabase
  const mockUser: User = {
    id: "1",
    username: "Alex Johnson",
    email: "alex@example.com",
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    // Simulating checking for logged in user
    const checkAuth = async () => {
      try {
        // In a real app, we would check if the user is logged in with Supabase
        const storedUser = localStorage.getItem('petpal_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be a Supabase auth call
      
      // Mock successful login
      setUser(mockUser);
      localStorage.setItem('petpal_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be a Supabase auth call
      
      // Mock successful registration
      const newUser = { ...mockUser, email, username };
      setUser(newUser);
      localStorage.setItem('petpal_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be a Supabase auth call
      
      // Mock successful logout
      setUser(null);
      localStorage.removeItem('petpal_user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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
