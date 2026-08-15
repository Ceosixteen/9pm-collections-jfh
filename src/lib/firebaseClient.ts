// Browser-safe Firebase init for customer-facing auth. Deliberately separate
// from src/lib/firebase.ts, which is server-only (it loads the config via
// Node's fs to dodge a Vercel ESM JSON-import quirk — those APIs don't exist
// in the browser bundle). Vite handles JSON imports natively client-side, so
// this file can import the config directly.
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
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

// Sent via our own backend (Admin SDK + Resend) instead of Firebase's
// built-in mailer, so the email is fully branded and lands from our own
// verified domain instead of Firebase's generic shared sending domain.
export async function sendLoginLink(email: string, redirectPath: string): Promise<void> {
  const res = await fetch('/api/auth/send-login-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, redirectPath }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.error || 'Failed to send sign-in link') as Error & { code?: string };
    err.code = data?.code;
    throw err;
  }
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
