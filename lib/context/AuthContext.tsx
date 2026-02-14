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
  loginWithGoogle: (userType?: UserType) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  confirmUserType: (type: UserType) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Holds session info when user_type is missing from metadata (e.g. Google OAuth new signup)
  const [pendingSession, setPendingSession] = useState<{ id: string; email: string } | null>(null);
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
            setIsLoading(false);
          } else {
            // No user_type in metadata (Google OAuth new signup).
            // Defer to a profile lookup outside this callback to avoid deadlock.
            setPendingSession({ id: session.user.id, email: session.user.email! });
          }
        } else if (event === 'INITIAL_SESSION' && !session) {
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setPendingSession(null);
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

  // Resolve user_type from profiles table when metadata is missing (Google OAuth).
  // Runs OUTSIDE the auth lock context, so no deadlock risk.
  useEffect(() => {
    if (!pendingSession) return;
    let cancelled = false;

    supabase
      .from('profiles')
      .select('user_type')
      .eq('id', pendingSession.id)
      .single()
      .then(({ data: profile }: { data: { user_type: string } | null }) => {
        if (cancelled) return;
        if (profile) {
          const dbType = profile.user_type as UserType;
          setUser({ id: pendingSession.id, email: pendingSession.email, type: dbType });
          // Don't call updateUser here — the user may not have confirmed their type yet
          // (e.g. new Google user on /auth/select-type). Metadata persistence is handled
          // by the callback route or the select-type page after explicit user choice.
        }
        setPendingSession(null);
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSession]);

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

  const loginWithGoogle = async (userType?: UserType) => {
    const redirectTo = userType
      ? `${window.location.origin}/auth/callback?user_type=${userType}`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
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
      // If identities is empty, the email already exists (Supabase returns a
      // fake success to prevent enumeration). Don't overwrite user state —
      // the metadata in the response reflects the signup call, not the DB.
      const identities = (authData.user as Record<string, unknown>).identities as unknown[] | undefined;
      if (!identities || identities.length === 0) {
        return { success: false, error: 'An account with this email already exists. Please log in instead.' };
      }

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

  const confirmUserType = async (type: UserType) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // Update profile type in DB
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ user_type: type })
        .eq('id', user.id);

      if (profileErr) {
        return { success: false, error: profileErr.message };
      }

      // If school, create the school record (handle_new_user defaulted to teacher)
      if (type === 'school') {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const fullName = (authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '') as string;
        const avatarUrl = (authUser?.user_metadata?.avatar_url || '') as string;

        const { data: existingSchool } = await supabase
          .from('schools')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existingSchool) {
          await supabase.from('schools').insert({
            user_id: user.id,
            name: fullName,
            email: user.email,
            profile_picture: avatarUrl || undefined,
          });
        }
      }

      // Persist in JWT metadata so middleware recognises the type.
      // updateUser patches the user record but does NOT re-sign the JWT,
      // so we must refreshSession to get a new JWT with updated claims.
      await supabase.auth.updateUser({ data: { user_type: type } });
      await supabase.auth.refreshSession();

      // Update local state
      setUser(prev => prev ? { ...prev, type } : prev);

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, confirmUserType, logout, isLoading }}>
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
