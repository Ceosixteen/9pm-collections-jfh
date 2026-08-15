// Browser-safe Firebase init for customer-facing auth. Deliberately separate
// from src/lib/firebase.ts, which is server-only (it loads the config via
// Node's fs to dodge a Vercel ESM JSON-import quirk — those APIs don't exist
// in the browser bundle). Vite handles JSON imports natively client-side, so
// this file can import the config directly.
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);

// The email is stashed in localStorage so that if the customer opens the
// sign-in link on the same device/browser they started on, we don't have to
// ask them to re-type it.
const PENDING_EMAIL_KEY = 'jfh_pending_signin_email';

export async function sendLoginLink(email: string, redirectPath: string): Promise<void> {
  const actionCodeSettings = {
    url: `${window.location.origin}${redirectPath}`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function isLoginLink(url: string): boolean {
  return isSignInWithEmailLink(auth, url);
}

export async function completeLoginWithLink(url: string, emailOverride?: string): Promise<User> {
  const email = emailOverride || window.localStorage.getItem(PENDING_EMAIL_KEY);
  if (!email) {
    throw new Error('MISSING_EMAIL');
  }
  const result = await signInWithEmailLink(auth, email, url);
  window.localStorage.removeItem(PENDING_EMAIL_KEY);
  return result.user;
}

export function getPendingEmail(): string | null {
  return window.localStorage.getItem(PENDING_EMAIL_KEY);
}

export function watchAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
