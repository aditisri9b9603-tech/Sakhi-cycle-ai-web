import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

// Initialize Firebase App
export const firebaseApp = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

// Initialize Firebase Auth
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

// Initialize Google Auth Provider for basic user authentication (fast, zero permission hurdles)
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('email');
googleAuthProvider.addScope('profile');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// Dedicated Google Workspace Auth Provider for advanced Workspace features (Calendar, Gmail, Sheets, etc.)
export const workspaceGoogleAuthProvider = new GoogleAuthProvider();
workspaceGoogleAuthProvider.addScope('email');
workspaceGoogleAuthProvider.addScope('profile');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/calendar.events');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/chat.messages.create');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/forms.body');
workspaceGoogleAuthProvider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');
workspaceGoogleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token caching per Google Workspace guidelines (never store in localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;
export const setCachedAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};
export const getCachedAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

// Initialize Cloud Firestore with the provisioned database ID
const firestoreDbId =
  (firebaseConfig as any)?.firestoreDatabaseId ||
  'ai-studio-sakhicycleaiweb-e444fa5a-f998-4c79-a963-f7d8b7624415';

export const firestore = firebaseApp
  ? getFirestore(firebaseApp, firestoreDbId)
  : null;

// Test connection on startup per Firebase skill instructions
export async function testConnection() {
  if (!firestore) return;
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (typeof window !== 'undefined' && firestore) {
  testConnection();
}
