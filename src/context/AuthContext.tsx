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
  accessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  hasWorkspaceAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let inMemoryAccessToken: string | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || 'guest@sakhicycle.app',
              displayName: currentUser.displayName || 'Sakhi Soul',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            }, { merge: true });
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

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        inMemoryAccessToken = credential.accessToken;
        setAccessToken(credential.accessToken);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Guest Sign-In Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    inMemoryAccessToken = null;
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
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
