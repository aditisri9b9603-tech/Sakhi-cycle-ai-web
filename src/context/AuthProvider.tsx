import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  firebaseAuth,
  googleAuthProvider,
  isFirebaseConfigured,
} from '../lib/firebaseClient';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Unified User interface compatible across the app
export interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  provider?: 'firebase' | 'supabase' | 'local';
}

export type AuthProviderType = 'firebase' | 'supabase' | 'local';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isSigningIn: boolean;
  authNotice: string | null;
  authError: {
    title: string;
    message: string;
    actionableGuide?: string[];
  } | null;
  clearAuthNotice: () => void;
  clearAuthError: () => void;
  activeProvider: AuthProviderType;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithOtp: (email: string) => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  accessToken: string | null;
  hasWorkspaceAuth: boolean;
  isSupabaseConnected: boolean;
  isFirebaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_GUEST_KEY = 'sakhi_local_guest_session';
const GOOGLE_ACCESS_TOKEN_KEY = 'sakhi_google_access_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authError, setAuthError] = useState<{
    title: string;
    message: string;
    actionableGuide?: string[];
  } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY) || null;
  });

  const clearAuthNotice = () => setAuthNotice(null);
  const clearAuthError = () => setAuthError(null);

  // Determine active provider:
  // If Supabase is explicitly configured with non-empty URL and Key, use Supabase.
  // Otherwise if Firebase is provisioned, use Firebase.
  // Otherwise fallback to local device mode.
  const activeProvider: AuthProviderType = isSupabaseConfigured
    ? 'supabase'
    : isFirebaseConfigured && firebaseAuth
    ? 'firebase'
    : 'local';

  // Helper to map Supabase User
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
      provider: 'supabase',
    };
  };

  // Helper to map Firebase User
  const mapFirebaseUser = (fu: FirebaseUser | null): AuthUser | null => {
    if (!fu) return null;
    return {
      id: fu.uid,
      uid: fu.uid,
      email: fu.email || null,
      displayName: fu.displayName || fu.email?.split('@')[0] || 'Sakhi User',
      photoURL: fu.photoURL || null,
      isAnonymous: fu.isAnonymous,
      provider: 'firebase',
    };
  };

  // Check URL parameters for OAuth errors or callbacks on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for URL errors returned from OAuth redirects (e.g. Supabase or Google)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const error = urlParams.get('error') || hashParams.get('error');
    const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
    const errorDescription =
      urlParams.get('error_description') ||
      hashParams.get('error_description') ||
      urlParams.get('msg');

    if (error || errorCode || errorDescription) {
      console.warn('OAuth redirect error detected:', { error, errorCode, errorDescription });

      const currentOrigin = window.location.origin;
      const currentHost = window.location.hostname;

      if (
        errorCode === 'validation_failed' ||
        (errorDescription && errorDescription.includes('provider is not enabled')) ||
        error === 'unsupported_provider'
      ) {
        setAuthError({
          title: 'Google Sign-In Provider Not Enabled in Dashboard',
          message:
            'The backend returned: "Unsupported provider: provider is not enabled". Google authentication must be activated in your provider dashboard before users can sign in with Google.',
          actionableGuide: [
            activeProvider === 'supabase'
              ? 'Go to Supabase Dashboard → Authentication → Providers → Google.'
              : 'Go to Firebase Console → Authentication → Sign-in method → Add new provider → Google.',
            'Toggle the Google provider to "Enabled".',
            'Configure your OAuth Client ID and Secret.',
            `Add Authorized Redirect URI: ${currentOrigin}/auth/v1/callback (for Supabase) or authorized domain ${currentHost} (for Firebase).`,
            'Save changes in the dashboard and retry.',
          ],
        });
      } else {
        setAuthError({
          title: 'Authentication Notice',
          message: decodeURIComponent(errorDescription || error || 'Sign-in encountered an issue.'),
          actionableGuide: [
            `Current Application Origin: ${currentOrigin}`,
            'Ensure this origin is added to the allowed redirect URLs in your authentication settings.',
          ],
        });
      }

      // Clean the query/hash parameters from URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [activeProvider]);

  // Main Auth Initialization & Listener
  useEffect(() => {
    let mounted = true;

    // --- CASE 1: FIREBASE ACTIVE ---
    if (activeProvider === 'firebase' && firebaseAuth) {
      // Check for redirect result if signInWithRedirect was used
      getRedirectResult(firebaseAuth)
        .then((result) => {
          if (!mounted || !result) return;
          const userObj = mapFirebaseUser(result.user);
          setUser(userObj);
          const cred = GoogleAuthProvider.credentialFromResult(result);
          if (cred?.accessToken) {
            setAccessToken(cred.accessToken);
            localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, cred.accessToken);
          }
          setAuthNotice('Welcome to Sakhi Cycle! Successfully signed in with Google.');
        })
        .catch((err) => {
          console.warn('Firebase getRedirectResult error:', err);
        });

      // Listen to Firebase Auth state
      const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser) => {
        if (!mounted) return;
        if (fbUser) {
          setUser(mapFirebaseUser(fbUser));
          localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
        } else {
          // Check for existing local guest
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
        unsubscribe();
      };
    }

    // --- CASE 2: SUPABASE ACTIVE ---
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      async function initSupabaseAuth() {
        try {
          const { data, error } = await supabase!.auth.getSession();
          if (error) {
            console.warn('Supabase getSession notice:', error.message);
          }
          if (mounted && data?.session) {
            setSession(data.session);
            setUser(mapSupabaseUser(data.session.user));
            if (data.session.provider_token) {
              setAccessToken(data.session.provider_token);
              localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, data.session.provider_token);
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth init check:', err);
        }

        // Check local guest session
        const savedGuest = localStorage.getItem(LOCAL_STORAGE_GUEST_KEY);
        if (savedGuest && mounted) {
          try {
            setUser(JSON.parse(savedGuest));
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
          }
        }

        if (mounted) setLoading(false);
      }

      initSupabaseAuth();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(mapSupabaseUser(currentSession.user));
          if (currentSession.provider_token) {
            setAccessToken(currentSession.provider_token);
            localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, currentSession.provider_token);
          }
          localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
        } else {
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

    // --- CASE 3: LOCAL DEVICE FALLBACK ---
    const savedGuest = localStorage.getItem(LOCAL_STORAGE_GUEST_KEY);
    if (savedGuest) {
      try {
        setUser(JSON.parse(savedGuest));
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
      }
    }
    setLoading(false);

    return () => {
      mounted = false;
    };
  }, [activeProvider]);

  // Handler: Google Sign-In
  const signInWithGoogle = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    clearAuthError();

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    // 1. FIREBASE AUTH GOOGLE SIGN IN
    if (activeProvider === 'firebase' && firebaseAuth) {
      try {
        const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
        const mapped = mapFirebaseUser(result.user);
        setUser(mapped);

        // Capture OAuth access token for Google Workspace
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setAccessToken(credential.accessToken);
          localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, credential.accessToken);
        }

        setAuthNotice('Signed in successfully with Google!');
        return true;
      } catch (err: any) {
        console.warn('Firebase signInWithPopup error code:', err?.code, err?.message);

        // Handle popup blocked by browser
        if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
          if (err?.code === 'auth/popup-blocked') {
            try {
              await signInWithRedirect(firebaseAuth, googleAuthProvider);
              return true;
            } catch (redirErr: any) {
              console.error('Firebase signInWithRedirect error:', redirErr);
            }
          }
          setIsSigningIn(false);
          return false;
        }

        // Handle provider not enabled in Firebase
        if (err?.code === 'auth/operation-not-allowed') {
          setAuthError({
            title: 'Google Sign-In Is Disabled in Firebase Console',
            message: 'Firebase Authentication has not enabled the Google provider for this project yet.',
            actionableGuide: [
              'Open your Firebase Console (https://console.firebase.google.com).',
              'Navigate to Build → Authentication → Sign-in method.',
              'Click "Add new provider", select "Google", toggle "Enable", and click Save.',
              `Ensure authorized domain "${currentHost}" is in Authentication → Settings → Authorized domains.`,
            ],
          });
          return false;
        }

        // Handle unauthorized domain
        if (err?.code === 'auth/unauthorized-domain') {
          setAuthError({
            title: 'Unauthorized Domain for Firebase Authentication',
            message: `This app is running on "${currentHost}", which is not yet on the Firebase allowed domains list.`,
            actionableGuide: [
              'Open Firebase Console → Authentication → Settings → Authorized domains.',
              `Click "Add domain" and enter: ${currentHost}`,
              'Save changes and click Sign in with Google again.',
            ],
          });
          return false;
        }

        setAuthError({
          title: 'Google Sign-In Encountered an Issue',
          message: err?.message || 'Could not complete Google Sign-In.',
          actionableGuide: [
            'Check your network connection.',
            'You can also sign in with email or continue in private local guest mode.',
          ],
        });
        return false;
      } finally {
        setIsSigningIn(false);
      }
    }

    // 2. SUPABASE AUTH GOOGLE SIGN IN
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const redirectUrl = `${currentOrigin}/`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });

        if (error) {
          if (
            error.message.toLowerCase().includes('not enabled') ||
            error.message.toLowerCase().includes('unsupported provider')
          ) {
            setAuthError({
              title: 'Google Provider Not Enabled in Supabase',
              message:
                'Your Supabase project has not enabled the Google OAuth provider under Authentication → Providers.',
              actionableGuide: [
                'Log in to your Supabase Dashboard.',
                'Select your project → Authentication → Sign In / Providers.',
                'Find "Google", toggle it to "Enabled".',
                'Enter your Google Client ID and Google Client Secret.',
                `Add this Callback URL to your Google Cloud Console: ${import.meta.env.VITE_SUPABASE_URL || 'https://<project-ref>.supabase.co'}/auth/v1/callback`,
                `Add Redirect URL: ${redirectUrl}`,
              ],
            });
            return false;
          }
          throw error;
        }
        return true;
      } catch (err: any) {
        console.error('Supabase Google OAuth error:', err);
        setAuthError({
          title: 'Supabase OAuth Error',
          message: err?.message || 'Could not initiate Google sign-in with Supabase.',
          actionableGuide: [
            'Ensure Google provider is enabled in your Supabase project.',
            'Alternatively, you can sign in with Email & Password or use the local device session.',
          ],
        });
        return false;
      } finally {
        setIsSigningIn(false);
      }
    }

    // 3. LOCAL GUEST FALLBACK
    const guestUser: AuthUser = {
      id: `guest_${Date.now()}`,
      uid: `guest_${Date.now()}`,
      email: 'guest@sakhicycle.app',
      displayName: 'Sakhi Companion (Local)',
      photoURL: null,
      isAnonymous: true,
      provider: 'local',
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(guestUser));
    setAuthNotice('Continuing in Local Guest Mode. Your logs and settings are stored safely on this device.');
    setIsSigningIn(false);
    return true;
  };

  // Handler: Email Sign-In
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    clearAuthError();

    // Firebase
    if (activeProvider === 'firebase' && firebaseAuth) {
      try {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
        setUser(mapFirebaseUser(cred.user));
        setAuthNotice('Welcome back! Signed in with email.');
        return true;
      } catch (err: any) {
        if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
          // Attempt automatic signup
          try {
            const newCred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
            setUser(mapFirebaseUser(newCred.user));
            setAuthNotice('Account created successfully! Welcome to Sakhi Cycle.');
            return true;
          } catch (signUpErr: any) {
            setAuthError({
              title: 'Email Sign In / Registration',
              message: signUpErr?.message || 'Could not create account.',
            });
            return false;
          }
        }
        setAuthError({
          title: 'Email Sign In',
          message: err?.message || 'Could not sign in with email.',
        });
        return false;
      } finally {
        setIsSigningIn(false);
      }
    }

    // Supabase
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          if (
            error.message.toLowerCase().includes('invalid login credentials') ||
            error.message.toLowerCase().includes('user not found')
          ) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password: pass,
            });
            if (signUpError) throw signUpError;
            if (signUpData.user) {
              setUser(mapSupabaseUser(signUpData.user));
              setSession(signUpData.session);
              setAuthNotice('Account created successfully!');
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
        setAuthError({
          title: 'Supabase Email Sign In',
          message: err?.message || 'Could not complete email sign in.',
        });
        return false;
      } finally {
        setIsSigningIn(false);
      }
    }

    // Local device session
    const localUser: AuthUser = {
      id: `local_user_${Date.now()}`,
      uid: `local_user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      provider: 'local',
    };
    setUser(localUser);
    localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(localUser));
    setAuthNotice('Logged in to local device session.');
    setIsSigningIn(false);
    return true;
  };

  // Handler: OTP / Magic Link
  const signInWithOtp = async (email: string): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    clearAuthError();

    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
          },
        });
        if (error) throw error;
        setAuthNotice(`A secure magic login link has been sent to ${email}. Check your inbox.`);
        return true;
      } catch (err: any) {
        setAuthError({
          title: 'Magic Link Error',
          message: err?.message || 'Could not send login link.',
        });
        return false;
      } finally {
        setIsSigningIn(false);
      }
    }

    if (activeProvider === 'firebase' && firebaseAuth) {
      try {
        const actionCodeSettings = {
          url: typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:3000',
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
        localStorage.setItem('emailForSignIn', email);
        setAuthNotice(`Sign-in link sent to ${email}. Check your email.`);
        return true;
      } catch (err: any) {
        setAuthError({
          title: 'Magic Link Error',
          message: err?.message || 'Could not send sign-in link.',
        });
        return false;
      } finally {
        setIsSigningIn(false);
      }
    }

    setAuthNotice('Magic link requires Supabase or Firebase Authentication configuration.');
    setIsSigningIn(false);
    return false;
  };

  // Handler: Guest Sign-in
  const signInAsGuest = async (): Promise<boolean> => {
    setIsSigningIn(true);
    try {
      const guestUser: AuthUser = {
        id: `guest_${Date.now()}`,
        uid: `guest_${Date.now()}`,
        email: null,
        displayName: 'Sakhi Companion (Guest)',
        photoURL: null,
        isAnonymous: true,
        provider: 'local',
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
      if (activeProvider === 'firebase' && firebaseAuth) {
        await fbSignOut(firebaseAuth);
      }
      if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
      localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
      setUser(null);
      setSession(null);
      setAccessToken(null);
      setAuthNotice('Signed out successfully.');
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
        authError,
        clearAuthNotice,
        clearAuthError,
        activeProvider,
        signInWithGoogle,
        signInWithEmail,
        signInWithOtp,
        signInAsGuest,
        logout,
        accessToken,
        hasWorkspaceAuth: Boolean(accessToken),
        isSupabaseConnected: isSupabaseConfigured,
        isFirebaseConnected: isFirebaseConfigured,
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
