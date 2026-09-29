import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App using credentials from firebase-applet-config.json
export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

// Initialize Firebase Auth using getAuth
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseAuth = auth; // Alias for backward compatibility

// Configure GoogleAuthProvider with required scopes and account selector
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('email');
googleAuthProvider.addScope('profile');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// Unified User interface compatible across the app
export interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  provider?: 'firebase' | 'supabase' | 'local';
}

export type AuthProviderType = 'firebase' | 'supabase' | 'local';

export interface AuthContextType {
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
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  signInWithPhone: (phone: string, containerId?: string) => Promise<boolean>;
  verifyPhoneOtp: (code: string) => Promise<boolean>;
  phoneConfirmationPending: boolean;
  signInWithOtp: (email: string) => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  accessToken: string | null;
  hasWorkspaceAuth: boolean;
  isFirebaseConnected: boolean;
  isSupabaseConnected: boolean;
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
  const [phoneConfirmationPending, setPhoneConfirmationPending] = useState(false);
  const [authError, setAuthError] = useState<{
    title: string;
    message: string;
    actionableGuide?: string[];
  } | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY) || null;
  });

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const clearAuthNotice = () => setAuthNotice(null);
  const clearAuthError = () => setAuthError(null);

  // PRIMARY: Firebase Authentication takes first priority
  const activeProvider: AuthProviderType =
    isFirebaseConfigured && auth
      ? 'firebase'
      : isSupabaseConfigured && supabase
      ? 'supabase'
      : 'local';

  // Helper to map Firebase User
  const mapFirebaseUser = (fu: FirebaseUser | null): AuthUser | null => {
    if (!fu) return null;
    return {
      id: fu.uid,
      uid: fu.uid,
      email: fu.email || null,
      phoneNumber: fu.phoneNumber || null,
      displayName: fu.displayName || fu.email?.split('@')[0] || (fu.phoneNumber ? `User ${fu.phoneNumber.slice(-4)}` : 'Sakhi Member'),
      photoURL: fu.photoURL || null,
      isAnonymous: fu.isAnonymous,
      provider: 'firebase',
    };
  };

  // Helper to map Supabase User
  const mapSupabaseUser = (su: SupabaseUser | null): AuthUser | null => {
    if (!su) return null;
    const metadata = su.user_metadata || {};
    return {
      id: su.id,
      uid: su.id,
      email: su.email || null,
      displayName: metadata.full_name || metadata.name || su.email?.split('@')[0] || 'Sakhi Member',
      photoURL: metadata.avatar_url || metadata.picture || null,
      isAnonymous: false,
      provider: 'supabase',
    };
  };

  // Check URL parameters for OAuth errors or callbacks on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
      const currentHost = window.location.hostname;

      if (
        errorCode === 'validation_failed' ||
        (errorDescription && errorDescription.includes('provider is not enabled')) ||
        error === 'unsupported_provider'
      ) {
        setAuthError({
          title: 'Google Sign-In Provider Configuration',
          message:
            'Firebase Authentication is now configured. If Google Sign-In needs activation, toggle Google under Firebase Console → Authentication → Sign-in method.',
          actionableGuide: [
            'Go to Firebase Console (https://console.firebase.google.com).',
            `Select project: ${firebaseConfig.projectId}.`,
            'Navigate to Build → Authentication → Sign-in method.',
            'Click Google and toggle "Enable".',
            'Set your Project support email and save.',
            `Add Authorized Domain under Settings → Authorized domains: ${currentHost}`,
            'Retry Google Sign-in.',
          ],
        });
      } else {
        setAuthError({
          title: 'Authentication Notice',
          message: decodeURIComponent(errorDescription || error || 'Sign-in encountered an issue.'),
          actionableGuide: [
            `Current host: ${currentHost}`,
            'Ensure this domain is added to Authorized Domains in your Firebase Authentication settings.',
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
    if (activeProvider === 'firebase' && auth) {
      // Check for redirect result if signInWithRedirect was used
      getRedirectResult(auth)
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
          console.warn('Firebase getRedirectResult notice:', err);
        });

      // Listen to Firebase Auth state with onAuthStateChanged
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
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

    // --- CASE 2: SUPABASE ACTIVE (Fallback) ---
    if (activeProvider === 'supabase' && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
          if (session.provider_token) {
            setAccessToken(session.provider_token);
            localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, session.provider_token);
          }
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
          if (session.provider_token) {
            setAccessToken(session.provider_token);
            localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, session.provider_token);
          }
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
        setUser(null);
      }
    }
    setLoading(false);
    return () => {
      mounted = false;
    };
  }, [activeProvider]);

  // Ensure an invisible reCAPTCHA container exists in DOM
  const getOrCreateRecaptchaContainer = (containerId: string = 'recaptcha-container'): HTMLElement => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    return container;
  };

  /**
   * 1. Google Sign-In via Firebase
   * Uses signInWithPopup with auth and googleAuthProvider
   */
  const signInWithGoogle = async (): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    if (auth) {
      try {
        // Execute signInWithPopup with auth and GoogleAuthProvider
        const result = await signInWithPopup(auth, googleAuthProvider);
        if (result?.user) {
          const userObj = mapFirebaseUser(result.user);
          setUser(userObj);
          const cred = GoogleAuthProvider.credentialFromResult(result);
          if (cred?.accessToken) {
            setAccessToken(cred.accessToken);
            localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, cred.accessToken);
          }
          setAuthNotice(`Signed in as ${userObj?.displayName || userObj?.email || 'Google User'}`);
          setIsSigningIn(false);
          return true;
        }
      } catch (popupErr: any) {
        console.warn('Firebase popup sign-in notice:', popupErr);

        // If popup was blocked or closed by user, offer redirect fallback
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/popup-closed-by-user' ||
          popupErr.code === 'auth/cancelled-popup-request'
        ) {
          try {
            console.info('Switching to signInWithRedirect fallback...');
            await signInWithRedirect(auth, googleAuthProvider);
            return true;
          } catch (redirectErr: any) {
            console.error('Firebase redirect sign-in error:', redirectErr);
          }
        }

        // Actionable Error Handling
        if (popupErr.code === 'auth/operation-not-allowed') {
          setAuthError({
            title: 'Google Sign-In Provider Not Enabled in Firebase',
            message: `The Google provider is not yet enabled for project "${firebaseConfig.projectId}" in the Firebase Console.`,
            actionableGuide: [
              `Go to https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`,
              'Click Google and toggle "Enable".',
              'Fill in the support email and click Save.',
              `Ensure authorized domain is added: ${window.location.hostname}`,
            ],
          });
        } else if (popupErr.code === 'auth/unauthorized-domain') {
          setAuthError({
            title: 'Domain Not Authorized in Firebase',
            message: `This preview origin (${window.location.hostname}) is not listed in Authorized Domains.`,
            actionableGuide: [
              'Go to Firebase Console → Authentication → Settings → Authorized domains.',
              `Add domain: ${window.location.hostname}`,
              'Click Add and retry.',
            ],
          });
        } else {
          setAuthError({
            title: 'Google Sign-In Error',
            message: popupErr.message || 'Could not complete Google sign-in.',
          });
        }

        setIsSigningIn(false);
        return false;
      }
    }

    // Supabase fallback
    if (activeProvider === 'supabase' && supabase) {
      try {
        const redirectTo = `${window.location.origin}/`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: { access_type: 'offline', prompt: 'consent' },
            scopes: 'email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets',
          },
        });
        if (error) throw error;
        return true;
      } catch (err: any) {
        console.error('Supabase Google OAuth error:', err);
        setAuthError({
          title: 'Supabase OAuth Error',
          message: err.message || 'Google OAuth is not configured on Supabase.',
        });
        setIsSigningIn(false);
        return false;
      }
    }

    // Guest fallback
    return await signInAsGuest();
  };

  // 2. Email & Password Sign-In
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        if (cred.user) {
          setUser(mapFirebaseUser(cred.user));
          setAuthNotice(`Signed in as ${cred.user.email}`);
          setIsSigningIn(false);
          return true;
        }
      } catch (err: any) {
        console.warn('Firebase email sign-in error:', err);
        let msg = err.message || 'Invalid email or password.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          msg = 'No account found with this email, or password was incorrect. Please check your credentials or register below.';
        } else if (err.code === 'auth/wrong-password') {
          msg = 'Incorrect password. Please try again.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Too many failed login attempts. Access temporarily restricted. Try again later or reset password.';
        }
        setAuthError({
          title: 'Sign In Failed',
          message: msg,
          actionableGuide: [
            'Check that you entered the right email address.',
            'If you are new to Sakhi Cycle, use the "Register" button to create an account.',
          ],
        });
        setIsSigningIn(false);
        return false;
      }
    }

    // Supabase fallback
    if (activeProvider === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) throw error;
        if (data.user) {
          setUser(mapSupabaseUser(data.user));
          setAuthNotice(`Signed in as ${data.user.email}`);
          setIsSigningIn(false);
          return true;
        }
      } catch (err: any) {
        setAuthError({
          title: 'Sign In Failed',
          message: err.message || 'Invalid credentials.',
        });
        setIsSigningIn(false);
        return false;
      }
    }

    setIsSigningIn(false);
    return false;
  };

  // 3. Register with Email & Password
  const registerWithEmail = async (email: string, pass: string, name?: string): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (cred.user) {
          if (name) {
            await updateProfile(cred.user, { displayName: name }).catch(() => {});
          }
          const userObj = mapFirebaseUser(cred.user);
          if (name && userObj) userObj.displayName = name;
          setUser(userObj);
          setAuthNotice('Account created successfully! Welcome to Sakhi Cycle.');
          setIsSigningIn(false);
          return true;
        }
      } catch (err: any) {
        console.warn('Firebase registration error:', err);
        let msg = err.message || 'Could not create account.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'This email is already registered. Please sign in instead.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password should be at least 6 characters with a combination of letters and numbers.';
        }
        setAuthError({
          title: 'Registration Error',
          message: msg,
        });
        setIsSigningIn(false);
        return false;
      }
    }

    setIsSigningIn(false);
    return false;
  };

  // 4. Phone Authentication via Firebase
  const signInWithPhone = async (phoneNumber: string, containerId: string = 'recaptcha-container'): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    if (auth) {
      try {
        getOrCreateRecaptchaContainer(containerId);

        // Format to E.164 if needed (e.g. +91XXXXXXXXXX)
        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('+')) {
          // If 10 digits provided, assume +91
          if (/^\d{10}$/.test(formattedPhone)) {
            formattedPhone = `+91${formattedPhone}`;
          } else {
            formattedPhone = `+${formattedPhone}`;
          }
        }

        // Initialize invisible reCAPTCHA verifier
        if (!recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA solved
            },
            'expired-callback': () => {
              recaptchaVerifierRef.current = null;
            },
          });
        }

        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifierRef.current
        );

        confirmationResultRef.current = confirmation;
        setPhoneConfirmationPending(true);
        setAuthNotice(`6-digit verification code sent to ${formattedPhone}`);
        setIsSigningIn(false);
        return true;
      } catch (err: any) {
        console.error('Firebase Phone Auth error:', err);
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch {}
          recaptchaVerifierRef.current = null;
        }

        let msg = err.message || 'Could not send SMS verification code.';
        if (err.code === 'auth/invalid-phone-number') {
          msg = 'Invalid phone number format. Please include your country code (e.g. +91 9876543210).';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'SMS quota or rate limit exceeded. Please wait or use Google sign-in.';
        }

        setAuthError({
          title: 'Phone Authentication Error',
          message: msg,
          actionableGuide: [
            'Ensure your phone number includes the international country code (e.g., +91 for India, +1 for USA).',
            'Make sure "Phone" provider is enabled in Firebase Console → Authentication → Sign-in method.',
          ],
        });
        setIsSigningIn(false);
        return false;
      }
    }

    setAuthError({
      title: 'Phone Auth Unavailable',
      message: 'Firebase Authentication is required for phone verification.',
    });
    setIsSigningIn(false);
    return false;
  };

  // Verify Phone OTP
  const verifyPhoneOtp = async (code: string): Promise<boolean> => {
    if (!confirmationResultRef.current) {
      setAuthError({
        title: 'Session Expired',
        message: 'No pending phone verification found. Please request a new code.',
      });
      return false;
    }

    setIsSigningIn(true);
    try {
      const result = await confirmationResultRef.current.confirm(code);
      if (result.user) {
        setUser(mapFirebaseUser(result.user));
        setPhoneConfirmationPending(false);
        confirmationResultRef.current = null;
        setAuthNotice('Phone verified successfully! Welcome to Sakhi Cycle.');
        setIsSigningIn(false);
        return true;
      }
    } catch (err: any) {
      console.error('Phone OTP verification error:', err);
      setAuthError({
        title: 'Verification Failed',
        message: err.message || 'Invalid verification code. Please check and retry.',
      });
      setIsSigningIn(false);
      return false;
    }
    setIsSigningIn(false);
    return false;
  };

  // 5. Email Magic Link / OTP fallback
  const signInWithOtp = async (email: string): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    if (activeProvider === 'supabase' && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setAuthNotice('Magic sign-in link sent to your email.');
        setIsSigningIn(false);
        return true;
      } catch (err: any) {
        setAuthError({
          title: 'Magic Link Error',
          message: err.message || 'Could not send link.',
        });
        setIsSigningIn(false);
        return false;
      }
    }

    setAuthNotice(`Sign-in instructions dispatched for ${email}`);
    setIsSigningIn(false);
    return true;
  };

  // 6. Instant Guest Mode (Local & Anonymous)
  const signInAsGuest = async (): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();

    if (auth) {
      try {
        const cred = await signInAnonymously(auth);
        if (cred.user) {
          const userObj = mapFirebaseUser(cred.user);
          if (userObj) userObj.displayName = 'Sakhi Guest';
          setUser(userObj);
          setAuthNotice('Signed in as Guest (Synced to Firestore).');
          setIsSigningIn(false);
          return true;
        }
      } catch (anonErr) {
        console.warn('Anonymous sign-in skipped, falling back to local guest profile:', anonErr);
      }
    }

    const guestUser: AuthUser = {
      id: `guest_${Date.now()}`,
      uid: `guest_${Date.now()}`,
      email: null,
      displayName: 'Sakhi Guest',
      photoURL: null,
      isAnonymous: true,
      provider: 'local',
    };

    localStorage.setItem(LOCAL_STORAGE_GUEST_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    setAuthNotice('Signed in as Guest (Data stored securely on device).');
    setIsSigningIn(false);
    return true;
  };

  // 7. Logout
  const logout = async (): Promise<void> => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn('Firebase signOut error:', err);
      }
    }

    if (activeProvider === 'supabase' && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
    localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
    setUser(null);
    setSession(null);
    setAccessToken(null);
    setPhoneConfirmationPending(false);
    confirmationResultRef.current = null;
    clearAuthNotice();
    clearAuthError();
  };

  const hasWorkspaceAuth = Boolean(accessToken || user?.email);

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
        registerWithEmail,
        signInWithPhone,
        verifyPhoneOtp,
        phoneConfirmationPending,
        signInWithOtp,
        signInAsGuest,
        logout,
        accessToken,
        hasWorkspaceAuth,
        isFirebaseConnected: isFirebaseConfigured,
        isSupabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
      {/* Hidden container for Firebase phone invisible reCAPTCHA */}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
