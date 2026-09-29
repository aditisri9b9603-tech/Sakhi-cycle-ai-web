import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Clean unified User interface compatible across the app
export interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isSigningIn: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithWorkspace?: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithOtp: (email: string) => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  isSupabaseConnected: boolean;
  accessToken: string | null;
  hasWorkspaceAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_GUEST_KEY = 'sakhi_local_guest_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const clearAuthNotice = () => setAuthNotice(null);

  // Helper to map Supabase User to unified AuthUser
  const mapSupabaseUser = (su: SupabaseUser | null): AuthUser | null => {
    if (!su) return null;
    const metadata = su.user_metadata || {};
    return {
      id: su.id,
      uid: su.id,
      email: su.email || null,
      displayName: metadata.full_name || metadata.name || su.email?.split('@')[0] || 'Sakhi User',
      photoURL: metadata.avatar_url || metadata.picture || null,
      isAnonymous: false,
    };
  };

  // Restore session on mount and listen to auth changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession notice:', error.message);
          }
          if (mounted && data?.session) {
            setSession(data.session);
            setUser(mapSupabaseUser(data.session.user));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth init check:', err);
        }
      }

      // Check local guest session if no Supabase session
      const savedGuest = localStorage.getItem(LOCAL_STORAGE_GUEST_KEY);
      if (savedGuest && mounted) {
        try {
          const parsed = JSON.parse(savedGuest);
          setUser(parsed);
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // Listen to Supabase Auth state changes (OAuth redirect, token refresh, sign-out)
    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(mapSupabaseUser(currentSession.user));
          localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
        } else {
          // If logged out from Supabase, check if guest session existed
          const savedGuest = localStorage.getItem(LOCAL_STORAGE_GUEST_KEY);
          if (savedGuest) {
            try {
              setUser(JSON.parse(savedGuest));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Handler: Google OAuth Login via Supabase
  const signInWithGoogle = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);

    if (!isSupabaseConfigured || !supabase) {
      // Graceful offline mock/guest mode with friendly explanation
      const guestUser: AuthUser = {
        id: `offline-google-${Date.now()}`,
        uid: `offline-google-${Date.now()}`,
        email: 'user@example.com',
        displayName: 'Sakhi Companion',
        photoURL: null,
        isAnonymous: false,
      };
      setUser(guestUser);
      localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(guestUser));
      setAuthNotice(
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not yet configured in this preview environment. Logged in locally.'
      );
      setIsSigningIn(false);
      return true;
    }

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Supabase Google OAuth error:', err);
      setAuthNotice(err?.message || 'Google OAuth sign-in encountered an issue. You can also sign in with Email.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handler: Email & Password Sign-In / Automatic Register
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);

    if (!isSupabaseConfigured || !supabase) {
      // Local fallback
      const localUser: AuthUser = {
        id: `email-${Date.now()}`,
        uid: `email-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      setUser(localUser);
      localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(localUser));
      setAuthNotice('Supabase credentials not configured in secrets. Logged in to local device session.');
      setIsSigningIn(false);
      return true;
    }

    try {
      // Try signing in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        // If user not found, automatically attempt signUp
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('user not found')
        ) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: pass,
          });

          if (signUpError) {
            throw signUpError;
          }

          if (signUpData.user) {
            setUser(mapSupabaseUser(signUpData.user));
            setSession(signUpData.session);
            setAuthNotice('Account created successfully! Welcome to Sakhi Cycle.');
            return true;
          } else {
            setAuthNotice('Check your email for the confirmation link to activate your account.');
            return true;
          }
        }
        throw error;
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
        setSession(data.session);
        setAuthNotice('Signed in successfully!');
        return true;
      }

      return true;
    } catch (err: any) {
      console.error('Supabase email sign in error:', err);
      setAuthNotice(err?.message || 'Could not complete email sign in.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handler: Magic link / OTP
  const signInWithOtp = async (email: string): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);

    if (!isSupabaseConfigured || !supabase) {
      setAuthNotice('Supabase is not configured to send magic links. Continuing with local guest session.');
      setIsSigningIn(false);
      return false;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setAuthNotice('Magic sign-in link sent to your email! Click it to sign in.');
      return true;
    } catch (err: any) {
      setAuthNotice(err?.message || 'Failed to send magic link.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handler: Instant Guest Mode (Privacy first)
  const signInAsGuest = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    try {
      const guestId = `guest-${Math.random().toString(36).substring(2, 9)}`;
      const guestUser: AuthUser = {
        id: guestId,
        uid: guestId,
        email: null,
        displayName: 'Guest Companion',
        photoURL: null,
        isAnonymous: true,
      };
      setUser(guestUser);
      localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(guestUser));
      setAuthNotice('Logged in as Guest. Your cycle logs are saved privately on this browser.');
      return true;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handler: Logout
  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
      setUser(null);
      setSession(null);
      setAuthNotice('Signed out. Your offline entries remain safely on this device.');
    } catch (err: any) {
      console.warn('Sign-out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSigningIn,
        authNotice,
        clearAuthNotice,
        signInWithGoogle,
        signInWithEmail,
        signInWithOtp,
        signInAsGuest,
        logout,
        isSupabaseConnected: isSupabaseConfigured,
        accessToken: session?.provider_token || null,
        hasWorkspaceAuth: Boolean(session?.provider_token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
