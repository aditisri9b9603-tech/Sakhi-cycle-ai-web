import { auth } from './firebaseClient';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

const persistenceReady = setPersistence(auth, browserLocalPersistence);

export async function signInWithEmail(email: string, password: string) {
  await persistenceReady;
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function createEmailAccount(email: string, password: string) {
  await persistenceReady;
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function resetEmailPassword(email: string) {
  if (!email.trim()) throw new Error('Enter your email address first.');
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signInWithGoogle() {
  if (typeof window !== 'undefined' && window.self !== window.top) {
    throw new Error('Google sign-in is blocked in the embedded preview. Open this app in a new browser tab and try again.');
  }

  await persistenceReady;

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}

export async function signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  await persistenceReady;
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export async function verifyPhoneCode(confirmationResult: ConfirmationResult, verificationCode: string) {
  await persistenceReady;
  return confirmationResult.confirm(verificationCode);
}

export function getSignInError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as any).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account already uses this email. Try signing in instead.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/unauthorized-domain':
      return 'This website domain is not authorized in Firebase Authentication.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Authentication.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Allow pop-ups or open the app in a new tab.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before sign-in finished.';
    case 'auth/network-request-failed':
      return 'Connection failed. Check your internet and try again.';
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format. Please include your country code (e.g. +91 9876543210).';
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please check the 6-digit code sent to your phone.';
    case 'auth/code-expired':
      return 'Verification code has expired. Please request a new code.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a few moments before trying again.';
    default:
      return error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
  }
}
