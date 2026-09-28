import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleAuthProvider, testFirestoreConnection } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSigningIn: boolean;
  accessToken: string | null;
  authNotice: string | null;
  clearAuthNotice: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  logout: () => Promise<void>;
  hasWorkspaceAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let inMemoryAccessToken: string | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync or create user document in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(
              userRef,
              {
                uid: currentUser.uid,
                email: currentUser.email || 'guest@sakhicycle.app',
                displayName: currentUser.displayName || (currentUser.isAnonymous ? 'Sakhi Guest' : 'Sakhi Soul'),
                photoURL: currentUser.photoURL || '',
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        } catch (e) {
          console.warn('Could not sync user profile to Firestore:', e);
        }
      } else {
        inMemoryAccessToken = null;
        setAccessToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthNotice = () => setAuthNotice(null);

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        inMemoryAccessToken = credential.accessToken;
        setAccessToken(credential.accessToken);
      }
      return true;
    } catch (error: any) {
      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';

      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorMessage.includes('popup-closed-by-user') ||
        errorMessage.includes('cancelled-popup-request')
      ) {
        // The user closed the popup before completing sign-in.
        // This is standard interaction rather than an unhandled application exception.
        console.info('Google Sign-In popup closed by user.');
        setAuthNotice('Sign-in cancelled. You can sign in anytime or use Guest Mode.');
        return false;
      }

      if (errorCode === 'auth/popup-blocked') {
        console.warn('Google Sign-In popup blocked by browser.');
        setAuthNotice('Popups were blocked by your browser. Please allow popups or use Guest Mode.');
        return false;
      }

      console.warn('Google Sign-In status:', errorMessage);
      setAuthNotice(errorMessage || 'Could not complete sign-in. Please try again.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInAsGuest = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthNotice(null);
    try {
      await signInAnonymously(auth);
      setAuthNotice('Signed in as Guest. Your cycle logs are saved in cloud storage!');
      return true;
    } catch (error: any) {
      console.warn('Guest sign-in notice:', error?.message);
      setAuthNotice('Guest sign-in is currently unavailable in this environment.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      inMemoryAccessToken = null;
      setAccessToken(null);
      setUser(null);
      setAuthNotice(null);
    } catch (err: any) {
      console.warn('Sign-out error:', err);
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
        clearAuthNotice,
        signInWithGoogle,
        signInAsGuest,
        logout,
        hasWorkspaceAuth: Boolean(accessToken),
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

export const getCachedAccessToken = () => inMemoryAccessToken;
