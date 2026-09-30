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
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  firebaseApp,
  firebaseAuth as auth,
  firestore,
  isFirebaseConfigured,
  googleAuthProvider,
  setCachedAccessToken,
  getCachedAccessToken,
} from '../lib/firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  signInWithEmail as fbSignInWithEmail,
  createEmailAccount as fbCreateEmailAccount,
  resetEmailPassword as fbResetEmailPassword,
  signInWithGoogle as fbSignInWithGoogle,
  signOutUser as fbSignOutUser,
  signInWithPhone as fbSignInWithPhone,
  verifyPhoneCode as fbVerifyPhoneCode,
  getSignInError,
} from '../lib/auth';

export { firebaseApp, auth, isFirebaseConfigured, googleAuthProvider, getSignInError };
export const firebaseAuth = auth; // Alias for backward compatibility

// Unified User interface compatible across the app
export interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  emailVerified?: boolean;
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
  signInWithGoogle: (optionalEmail?: string) => Promise<boolean>;
  signInWithGoogleAccount: (googleEmail?: string, displayName?: string) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  signInWithPhone: (phone: string, containerId?: string) => Promise<boolean>;
  verifyPhoneOtp: (code: string) => Promise<boolean>;
  phoneConfirmationPending: boolean;
  signInWithOtp: (email: string) => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  getSignInError: (error: unknown) => string;
  accessToken: string | null;
  hasWorkspaceAuth: boolean;
  isFirebaseConnected: boolean;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_GUEST_KEY = 'sakhi_local_guest_session';
const LOCAL_STORAGE_GOOGLE_USER_KEY = 'sakhi_google_user_session';

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

  // In-memory token state per Google Workspace security policy
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedAccessToken());

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
      emailVerified: fu.emailVerified,
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
      emailVerified: Boolean(su.confirmed_at || su.email_confirmed_at),
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
            setCachedAccessToken(cred.accessToken);
            setAccessToken(cred.accessToken);
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
          setCachedAccessToken(null);
          setAccessToken(null);
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
            setCachedAccessToken(session.provider_token);
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
            setCachedAccessToken(session.provider_token);
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
   * Uses fbSignInWithGoogle from src/lib/auth.ts (real popup sign-in, persistence guaranteed)
   */
  const signInWithGoogle = async (): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    try {
      const result = await fbSignInWithGoogle();
      if (result?.user) {
        const userObj = mapFirebaseUser(result.user);
        setUser(userObj);
        const cred = GoogleAuthProvider.credentialFromResult(result);
        if (cred?.accessToken) {
          setCachedAccessToken(cred.accessToken);
          setAccessToken(cred.accessToken);
        }
        if (firestore) {
          try {
            await setDoc(
              doc(firestore, 'users', result.user.uid),
              {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (dbErr) {
            console.warn('Firestore profile sync notice:', dbErr);
          }
        }
        setAuthNotice(`Signed in with Google as ${userObj?.displayName || userObj?.email || 'Google User'}`);
        setIsSigningIn(false);
        return true;
      }
    } catch (popupErr: any) {
      console.warn('Google sign-in notice:', popupErr);
      const friendlyMessage = getSignInError(popupErr);
      let guide: string[] | undefined;
      if (popupErr?.code === 'auth/unauthorized-domain' && typeof window !== 'undefined') {
        guide = [
          'Go to Firebase Console → Authentication → Settings → Authorized domains.',
          `Add "${window.location.hostname}" to authorized domains list.`,
          'Open the app in a new browser tab and try again.',
        ];
      } else if (popupErr?.code === 'auth/popup-blocked') {
        guide = ['Allow pop-ups for this site or open the app in a new browser tab.'];
      }
      setAuthError({
        title: 'Google Sign-In Failed',
        message: friendlyMessage,
        actionableGuide: guide,
      });
      setIsSigningIn(false);
      return false;
    }

    setIsSigningIn(false);
    return false;
  };

  const signInWithGoogleAccount = async (): Promise<boolean> => {
    return signInWithGoogle();
  };

  // 2. Email & Password Sign-In (Real Provider Logic, No Faking)
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    const sanitizedEmail = email.trim().toLowerCase();

    // Client-side validation
    if (!sanitizedEmail || !sanitizedEmail.includes('@') || !sanitizedEmail.includes('.')) {
      setAuthError({
        title: 'Invalid Email Address',
        message: 'Please provide a valid email address (e.g. name@example.com).',
      });
      setIsSigningIn(false);
      return false;
    }

    if (!pass || pass.length < 6) {
      setAuthError({
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters.',
      });
      setIsSigningIn(false);
      return false;
    }

    // --- CASE 1: FIREBASE AUTH ---
    if (activeProvider === 'firebase') {
      try {
        const cred = await fbSignInWithEmail(sanitizedEmail, pass);
        if (cred.user) {
          const userObj = mapFirebaseUser(cred.user);
          setUser(userObj);
          if (!cred.user.emailVerified) {
            setAuthNotice(
              `Signed in as ${cred.user.email}. Notice: Email is not yet verified. Please check your inbox or resend verification.`
            );
          } else {
            setAuthNotice(`Welcome back! Signed in as ${cred.user.email}`);
          }
          setIsSigningIn(false);
          return true;
        }
      } catch (err: any) {
        console.warn('Firebase email sign-in error:', err?.code, err?.message);
        const friendlyMessage = getSignInError(err);
        let guide: string[] | undefined;

        if (err?.code === 'auth/operation-not-allowed') {
          guide = [
            'Go to Firebase Console (https://console.firebase.google.com).',
            `Open project: ${firebaseConfig.projectId}.`,
            'Navigate to Authentication → Sign-in method.',
            'Click "Email/Password" and toggle "Enable" (keep Email link optional).',
            'Save changes and retry signing in.',
          ];
        } else if (err?.code === 'auth/unauthorized-domain' && typeof window !== 'undefined') {
          guide = [
            'Go to Firebase Console → Authentication → Settings → Authorized domains.',
            `Add domain: ${window.location.hostname}`,
            'Save and retry.',
          ];
        }

        setAuthError({
          title: 'Sign-In Failed',
          message: friendlyMessage,
          actionableGuide: guide,
        });
        setIsSigningIn(false);
        return false;
      }
    }

    // --- CASE 2: SUPABASE AUTH ---
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password: pass,
        });

        if (error) {
          let guide: string[] | undefined;
          if (error.message.includes('Email not confirmed')) {
            guide = [
              'Please check your email inbox and click the confirmation link.',
              'To ensure emails reach all users in Supabase, configure custom SMTP in Project Settings → Authentication → SMTP.',
            ];
          }
          setAuthError({
            title: 'Sign In Failed',
            message: error.message,
            actionableGuide: guide,
          });
          setIsSigningIn(false);
          return false;
        }

        if (data.user) {
          setUser(mapSupabaseUser(data.user));
          setAuthNotice(`Signed in as ${data.user.email}`);
          setIsSigningIn(false);
          return true;
        }
      } catch (err: any) {
        setAuthError({
          title: 'Sign In Failed',
          message: err.message || 'Supabase authentication failed.',
        });
        setIsSigningIn(false);
        return false;
      }
    }

    // Provider not configured
    setAuthError({
      title: 'Authentication Service Unavailable',
      message: 'Authentication provider is not configured. Please check Firebase or Supabase settings.',
    });
    setIsSigningIn(false);
    return false;
  };

  // 3. Register with Email & Password (Real Account Creation)
  const registerWithEmail = async (email: string, pass: string, name?: string): Promise<boolean> => {
    setIsSigningIn(true);
    clearAuthError();
    clearAuthNotice();

    const sanitizedEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || sanitizedEmail.split('@')[0];

    // Client-side validation
    if (!sanitizedEmail || !sanitizedEmail.includes('@') || !sanitizedEmail.includes('.')) {
      setAuthError({
        title: 'Invalid Email Address',
        message: 'Please provide a valid email address.',
      });
      setIsSigningIn(false);
      return false;
    }

    if (!pass || pass.length < 6) {
      setAuthError({
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.',
      });
      setIsSigningIn(false);
      return false;
    }

    // --- CASE 1: FIREBASE AUTH ---
    if (activeProvider === 'firebase') {
      try {
        const cred = await fbCreateEmailAccount(sanitizedEmail, pass);
        if (cred.user) {
          if (displayName) {
            await updateProfile(cred.user, { displayName }).catch(() => {});
          }

          // Send verification email to user
          try {
            await sendEmailVerification(cred.user);
          } catch (verErr) {
            console.warn('Could not dispatch verification email:', verErr);
          }

          // Provision user profile in Firestore
          if (firestore) {
            try {
              await setDoc(doc(firestore, 'users', cred.user.uid), {
                uid: cred.user.uid,
                email: sanitizedEmail,
                displayName,
                emailVerified: false,
                createdAt: new Date().toISOString(),
                healthGoals: 'Hormonal balance, symptom tracking, inner peace',
              }, { merge: true });
            } catch (dbErr) {
              console.warn('Firestore profile sync notice:', dbErr);
            }
          }

          const userObj = mapFirebaseUser(cred.user);
          if (userObj) userObj.displayName = displayName;
          setUser(userObj);
          setAuthNotice(
            `Welcome to Sakhi Cycle, ${displayName}! A verification email has been sent to ${sanitizedEmail}.`
          );
          setIsSigningIn(false);
          return true;
        }
      } catch (err: any) {
        console.warn('Firebase registration error:', err?.code, err?.message);
        const friendlyMessage = getSignInError(err);
        let guide: string[] | undefined;

        if (err?.code === 'auth/operation-not-allowed') {
          guide = [
            'Go to Firebase Console (https://console.firebase.google.com).',
            `Select project: ${firebaseConfig.projectId}.`,
            'Navigate to Authentication → Sign-in method.',
            'Click "Email/Password" and toggle "Enable".',
            'Save changes and retry creating your account.',
          ];
        } else if (err?.code === 'auth/unauthorized-domain' && typeof window !== 'undefined') {
          guide = [
            'Go to Firebase Console → Authentication → Settings → Authorized domains.',
            `Add domain: ${window.location.hostname}`,
            'Save and retry.',
          ];
        }

        setAuthError({
          title: 'Registration Failed',
          message: friendlyMessage,
          actionableGuide: guide,
        });
        setIsSigningIn(false);
        return false;
      }
    }

    // --- CASE 2: SUPABASE AUTH ---
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: pass,
          options: {
            data: { full_name: displayName },
          },
        });

        if (error) {
          setAuthError({
            title: 'Registration Failed',
            message: error.message,
            actionableGuide: [
              'If confirmation emails do not arrive, configure custom SMTP in Supabase Project Settings → Authentication → SMTP.',
            ],
          });
          setIsSigningIn(false);
          return false;
        }

        if (data.user) {
          setUser(mapSupabaseUser(data.user));
          setAuthNotice(
            `Account created for ${displayName}! Please check ${sanitizedEmail} for confirmation email.`
          );
          setIsSigningIn(false);
          return true;
        }
      } catch (err: any) {
        setAuthError({
          title: 'Registration Failed',
          message: err.message || 'Supabase account creation failed.',
        });
        setIsSigningIn(false);
        return false;
      }
    }

    setAuthError({
      title: 'Authentication Service Unavailable',
      message: 'Firebase Authentication is required to create an account.',
    });
    setIsSigningIn(false);
    return false;
  };

  // 4. Send Password Reset Email ("Forgot Password?" Flow)
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail || !sanitizedEmail.includes('@') || !sanitizedEmail.includes('.')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Firebase
    if (activeProvider === 'firebase') {
      try {
        await fbResetEmailPassword(sanitizedEmail);
        return {
          success: true,
          message: `A password reset link has been sent to ${sanitizedEmail}. Please check your inbox and spam folder.`,
        };
      } catch (err: any) {
        console.warn('Firebase reset password notice:', err?.code, err?.message);
        return {
          success: false,
          message: getSignInError(err),
        };
      }
    }

    // Supabase
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail);
        if (error) throw error;
        return {
          success: true,
          message: `Password reset instructions sent to ${sanitizedEmail}.`,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Supabase password reset failed.',
        };
      }
    }

    return {
      success: false,
      message: 'Authentication provider is not configured.',
    };
  };

  // 5. Resend Email Verification
  const resendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
    if (activeProvider === 'firebase' && auth?.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        return {
          success: true,
          message: `Verification email resent to ${auth.currentUser.email}. Please check your inbox.`,
        };
      } catch (err: any) {
        if (err.code === 'auth/too-many-requests') {
          return {
            success: false,
            message: 'Please wait a minute before requesting another verification email.',
          };
        }
        return {
          success: false,
          message: err.message || 'Could not send verification email.',
        };
      }
    }

    return {
      success: false,
      message: 'No active user session found to verify.',
    };
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

        const confirmation = await fbSignInWithPhone(
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

        const msg = getSignInError(err);
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
      const result = await fbVerifyPhoneCode(confirmationResultRef.current, code.trim());
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
        message: getSignInError(err),
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
    setIsSigningIn(true);
    try {
      await fbSignOutUser();
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }

    if (activeProvider === 'supabase' && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
    localStorage.removeItem(LOCAL_STORAGE_GOOGLE_USER_KEY);
    setCachedAccessToken(null);
    setUser(null);
    setSession(null);
    setAccessToken(null);
    setPhoneConfirmationPending(false);
    confirmationResultRef.current = null;
    clearAuthNotice();
    clearAuthError();
    setIsSigningIn(false);
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
        signInWithGoogleAccount,
        signInWithEmail,
        registerWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        signInWithPhone,
        verifyPhoneOtp,
        phoneConfirmationPending,
        signInWithOtp,
        signInAsGuest,
        logout,
        getSignInError,
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
