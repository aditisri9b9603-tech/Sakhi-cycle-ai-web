import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { AuthUser } from '../types';
import { auth as firebaseAuth } from '../lib/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isSigningIn: boolean;
  accessToken: string | null;
  authNotice: string | null;
  authError: string | null;
  clearAuthNotice: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithMagicLink: (email: string) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'sakhi_guest_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize Supabase Auth session listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession error:', error.message);
          }
          if (session?.user && mounted) {
            const u = session.user;
            setUser({
              id: u.id,
              email: u.email,
              displayName:
                u.user_metadata?.full_name ||
                u.user_metadata?.name ||
                (u.email ? u.email.split('@')[0] : 'Sakhi Soul'),
              photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
              isGuest: false,
              provider: (u.app_metadata?.provider as any) || 'email',
              createdAt: u.created_at,
            });
            setAccessToken(session.access_token);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Error reading initial Supabase session:', e);
        }

        // Setup real-time auth subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            if (session?.user) {
              const u = session.user;
              setUser({
                id: u.id,
                email: u.email,
                displayName:
                  u.user_metadata?.full_name ||
                  u.user_metadata?.name ||
                  (u.email ? u.email.split('@')[0] : 'Sakhi Soul'),
                photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
                isGuest: false,
                provider: (u.app_metadata?.provider as any) || 'email',
                createdAt: u.created_at,
              });
              setAccessToken(session.access_token);
              localStorage.removeItem(GUEST_STORAGE_KEY);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setAccessToken(null);
            }
            setLoading(false);
          }
        );

        // Check for guest or preserved local user
        const guestData = localStorage.getItem(GUEST_STORAGE_KEY);
        if (guestData && !user && mounted) {
          try {
            setUser(JSON.parse(guestData));
          } catch {
            localStorage.removeItem(GUEST_STORAGE_KEY);
          }
        }

        if (mounted) setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Fallback: Check local guest session or preserved Firebase user if offline
        const guestData = localStorage.getItem(GUEST_STORAGE_KEY);
        if (guestData && mounted) {
          try {
            setUser(JSON.parse(guestData));
          } catch {
            localStorage.removeItem(GUEST_STORAGE_KEY);
          }
        } else if (firebaseAuth?.currentUser && mounted) {
          const fc = firebaseAuth.currentUser;
          setUser({
            id: fc.uid,
            email: fc.email || 'guest@sakhicycle.app',
            displayName: fc.displayName || 'Sakhi Soul',
            photoURL: fc.photoURL || '',
            isGuest: fc.isAnonymous,
            provider: 'guest',
          });
        }
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const clearAuthNotice = () => {
    setAuthNotice(null);
    setAuthError(null);
  };

  // Sign In with Google via Supabase OAuth
  const signInWithGoogle = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    setAuthError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const redirectUrl = window.location.origin;
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

        if (error) {
          console.warn('Supabase Google OAuth error:', error.message);
          setAuthError(error.message);
          return false;
        }

        setAuthNotice('Redirecting to Google securely...');
        return true;
      } catch (err: any) {
        console.error('Google Sign-In caught error:', err);
        setAuthError(err.message || 'Could not initiate Google sign-in.');
        return false;
      } finally {
        setIsSigningIn(false);
      }
    } else {
      setAuthNotice('Supabase credentials missing in environment. Using instant guest access.');
      return signInAsGuest();
    }
  };

  // Sign In with Magic Link via Supabase
  const signInWithMagicLink = async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }
    setIsSigningIn(true);
    setAuthNotice(null);
    setAuthError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          setAuthError(error.message);
          return false;
        }

        setAuthNotice(`✨ Magic sign-in link sent to ${email}! Check your inbox to sign in.`);
        return true;
      } catch (err: any) {
        setAuthError(err.message || 'Failed to send magic link.');
        return false;
      } finally {
        setIsSigningIn(false);
      }
    } else {
      setAuthError('Supabase is not configured to send magic links.');
      setIsSigningIn(false);
      return false;
    }
  };

  // Sign In or Sign Up with Email & Password via Supabase
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    if (!email || !pass) {
      setAuthError('Please provide both email and password.');
      return false;
    }
    if (pass.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return false;
    }

    setIsSigningIn(true);
    setAuthNotice(null);
    setAuthError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        // Try signing in
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (signInErr) {
          // If invalid credentials or user not found, attempt sign up
          if (
            signInErr.message.includes('Invalid login credentials') ||
            signInErr.message.includes('User not found')
          ) {
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email,
              password: pass,
              options: {
                data: {
                  full_name: email.split('@')[0],
                },
              },
            });

            if (signUpErr) {
              setAuthError(signUpErr.message);
              return false;
            }

            if (signUpData.session) {
              setAuthNotice('Welcome! Your new Sakhi Cycle account is created and signed in.');
              return true;
            } else {
              setAuthNotice(`Account created! Please check ${email} for confirmation if email verification is enabled.`);
              return true;
            }
          } else {
            setAuthError(signInErr.message);
            return false;
          }
        }

        if (data.session) {
          setAuthNotice('Signed in successfully! Your cycle and logs are synced to Supabase.');
          return true;
        }
        return false;
      } catch (err: any) {
        setAuthError(err.message || 'Email authentication failed.');
        return false;
      } finally {
        setIsSigningIn(false);
      }
    } else {
      setAuthError('Supabase backend not detected. Using instant Guest mode.');
      return signInAsGuest();
    }
  };

  // Instant Guest Mode with safe local persistence and Supabase sync readiness
  const signInAsGuest = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    setAuthError(null);
    try {
      const guestUser: AuthUser = {
        id: `guest_${Date.now()}`,
        email: 'guest@sakhicycle.app',
        displayName: 'Sakhi Guest',
        photoURL: '',
        isGuest: true,
        provider: 'guest',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
      setAuthNotice('Active in Instant Guest Mode! All entries are safely saved on this device.');
      return true;
    } catch (err: any) {
      setAuthError('Could not initialize guest session.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setUser(null);
      setAccessToken(null);
      setAuthNotice('Signed out. Your entries remain safely on this device.');
    } catch (err: any) {
      console.warn('Sign-out error:', err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSigningIn,
        accessToken,
        authNotice,
        authError,
        clearAuthNotice,
        signInWithGoogle,
        signInWithMagicLink,
        signInWithEmail,
        signInAsGuest,
        logout,
        isSupabaseConnected: isSupabaseConfigured,
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
