import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: UserData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

interface UserData {
  full_name: string;
  phone_number: string;
  default_pickup_location: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: UserData) => {
    // Validate email domain
    if (!email.endsWith('@pitt.edu')) {
      throw new Error('Only @pitt.edu email addresses are allowed');
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Store user data in auth metadata for later
      },
    });

    if (error) throw error;

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required - user created but not logged in yet
      // Profile will be created after email confirmation via a database trigger or webhook
      return { requiresEmailConfirmation: true, user: data.user };
    }

    if (data.user && data.session) {
      // User is logged in immediately (email confirmation disabled)
      // Create user profile in public.users table
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            ...userData,
          });

        // Ignore duplicate key errors (profile might already exist)
        if (profileError && !profileError.message.includes('duplicate key')) {
          throw profileError;
        }
      } catch (err) {
        // If profile creation fails, still consider signup successful
        console.error('Profile creation error:', err);
      }

      return { requiresEmailConfirmation: false, user: data.user };
    }

    return { requiresEmailConfirmation: false, user: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Ensure user profile exists in public.users table
    if (data.user) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const userData = data.user.user_metadata;
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: userData.full_name || 'Unknown',
          phone_number: userData.phone_number || '',
          default_pickup_location: userData.default_pickup_location || 'Other',
        });
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const getAccessToken = () => {
    return session?.access_token ?? null;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
