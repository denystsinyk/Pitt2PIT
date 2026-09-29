import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: UserData) => Promise<{
    requiresEmailConfirmation: boolean;
    user: User | null;
  }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

interface UserData {
  full_name: string;
  phone_number: string;
  default_pickup_location: string;
}

async function saveProfile(accessToken: string, userData: UserData) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Could not save your profile');
  }
}

async function ensureProfile(accessToken: string, userData: UserData) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.ok) return;
  if (response.status !== 404) throw new Error('Could not load your profile');
  await saveProfile(accessToken, userData);
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
      await saveProfile(data.session.access_token, userData);
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
      const metadata = data.user.user_metadata;
      await ensureProfile(data.session!.access_token, {
        full_name: metadata.full_name || '',
        phone_number: metadata.phone_number || '',
        default_pickup_location: metadata.default_pickup_location || '',
      });
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
