// Firebase Admin SDK — used ONLY to generate passwordless sign-in links
// ourselves (so we can email them via Resend with full branding) instead of
// letting Firebase's own mail system send its generic, unbranded email.
// Everything else in this app deliberately avoids the Admin SDK (see
// src/lib/firebase.ts) — this is the one spot that needs it.
import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

let app: App | undefined;

function loadServiceAccount(): ServiceAccount {
  // Production (Vercel): the full JSON is stored as one env var.
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    return JSON.parse(inline);
  }
  // Local dev: point at the downloaded key file instead of duplicating its
  // contents into .env.local.
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH;
  if (path) {
    return JSON.parse(readFileSync(path, 'utf-8'));
  }
  throw new Error(
    'Missing Firebase service account credentials — set FIREBASE_SERVICE_ACCOUNT_JSON (production) or FIREBASE_SERVICE_ACCOUNT_JSON_PATH (local dev).'
  );
}

function getFirebaseAdminApp(): App {
  if (!app) {
    const existing = getApps();
    app = existing.length ? existing[0] : initializeApp({ credential: cert(loadServiceAccount()) });
  }
  return app;
}

// Generates a real Firebase email-link sign-in URL without triggering
// Firebase's own email send — the link is identical in form to one Firebase
// would have emailed itself, so the existing client-side
// isSignInWithEmailLink/signInWithEmailLink flow keeps working unchanged.
export async function generateEmailSignInLink(email: string, continueUrl: string): Promise<string> {
  return getAuth(getFirebaseAdminApp()).generateSignInWithEmailLink(email, {
    url: continueUrl,
    handleCodeInApp: true,
  });
}
