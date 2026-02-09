'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, UserType } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface SignupData {
  email: string;
  password: string;
  type: UserType;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  emisNumber?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    let mounted = true;

    // IMPORTANT: onAuthStateChange callbacks are awaited inside gotrue-js's
    // _notifyAllSubscribers, which runs INSIDE the session lock. Any Supabase
    // query here (e.g. supabase.from('profiles').select()) calls getSession()
    // which tries to re-acquire the same lock → circular deadlock.
    // Therefore: read user_type from session metadata ONLY. No DB queries.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: { user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
        if (!mounted) return;

        if (event === 'TOKEN_REFRESHED') return;

        if (
          (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') &&
          session?.user
        ) {
          const userType = session.user.user_metadata?.user_type as UserType | undefined;

          if (userType) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              type: userType,
            });
          }
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION' && !session) {
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconcile user_type against the profiles table (source of truth).
  // JWT metadata can be stale if user_type was changed in the DB (e.g. admin promotion).
  // This runs OUTSIDE the auth lock context, so no deadlock risk.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
      .then(({ data: profile }: { data: { user_type: string } | null }) => {
        if (cancelled || !profile) return;
        const dbType = profile.user_type as UserType;
        if (dbType !== user.type) {
          setUser(prev => prev ? { ...prev, type: dbType } : prev);
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const userType = data.user.user_metadata?.user_type as UserType | undefined;
      if (userType) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          type: userType,
        });
      }
    }

    return { success: true };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signup = async (data: SignupData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          user_type: data.type,
          first_name: data.firstName,
          last_name: data.lastName,
          school_name: data.schoolName,
          emis_number: data.emisNumber,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (authData.user) {
      const userType = authData.user.user_metadata?.user_type as UserType | undefined;
      if (userType) {
        setUser({
          id: authData.user.id,
          email: authData.user.email!,
          type: userType,
        });
      }
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
