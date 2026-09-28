import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Standard Google Auth Provider for App Login (Profile & Email ONLY)
// Note: Standard scopes require NO Google OAuth App Verification and work for all Google accounts.
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('email');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// Dedicated Google Workspace Auth Provider (Gmail, Chat, Forms)
// Used selectively in the Workspace Hub when the user requests Google Workspace linkage.
export const workspaceGoogleAuthProvider = new GoogleAuthProvider();
workspaceGoogleAuthProvider.addScope('https://mail.google.com/');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/chat.spaces');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/chat.messages.create');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/forms.body');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');

// Standard Firestore Error Handling Helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.warn('Firestore Context Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test on initial startup
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('🌸 Firebase Firestore connection verified');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline mode active. Using local fallback.');
    }
    return false;
  }
}
