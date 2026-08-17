// Generates passwordless sign-in links ourselves (so we can email them via
// Resend with full branding) instead of letting Firebase's own mail system
// send its generic, unbranded email.
//
// Deliberately does NOT use the `firebase-admin` npm package — its auth
// module pulls in `jwks-rsa` -> `jose`, which hits an ESM/CJS interop crash
// under Vercel's Node serverless bundler (ERR_REQUIRE_ESM). Everything the
// Admin SDK's `generateSignInWithEmailLink` does under the hood is just a
// service-account-authenticated REST call, so we replicate that directly
// with Node's built-in `crypto` + `fetch` — the same "avoid heavy SDKs, use
// REST" approach already used elsewhere in this backend (see
// verifyFirebaseIdToken in app.ts).
import { readFileSync } from 'fs';
import crypto from 'crypto';
import { firebaseStorageBucket } from '../../src/lib/firebase.js';

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

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

let cachedToken: { token: string; expiresAt: number } | null = null;

// Exchanges the service account's private key for a short-lived Google
// OAuth2 access token via the JWT-bearer flow (RFC 7523) — signed locally,
// no external library needed.
async function getGoogleAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const sa = loadServiceAccount();
  const nowSeconds = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSeconds,
    exp: nowSeconds + 3600,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform',
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedClaims = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signingInput = `${encodedHeader}.${encodedClaims}`;

  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key).toString('base64url');
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to obtain Google access token: ${await res.text()}`);
  }

  const data: any = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

// Generates a real Firebase email-link sign-in URL without triggering
// Firebase's own email send (returnOobLink is only honored for
// service-account-authenticated callers) — the link is identical in form to
// one Firebase would have emailed itself, so the existing client-side
// isSignInWithEmailLink/signInWithEmailLink flow keeps working unchanged.
export async function generateEmailSignInLink(email: string, continueUrl: string): Promise<string> {
  const accessToken = await getGoogleAccessToken();

  const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      requestType: 'EMAIL_SIGNIN',
      email,
      continueUrl,
      canHandleCodeInApp: true,
      returnOobLink: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate sign-in link: ${await res.text()}`);
  }

  const data: any = await res.json();
  if (!data.oobLink) {
    throw new Error('Firebase did not return a sign-in link');
  }
  return data.oobLink;
}

// Uploads an image to Firebase Storage entirely server-side, using the same
// service account as everything else in this file. Deliberately NOT done via
// the client-side Firebase Storage SDK — the admin panel doesn't sign
// visitors into Firebase Auth (it uses its own cookie-based session), so a
// direct browser upload would be rejected by Storage's default security
// rules with no clean way around it. A service-account-authenticated request
// to the underlying Cloud Storage API bypasses Firebase Storage Rules
// entirely (they only govern client-SDK/Firebase-Auth-context requests), so
// this works regardless of what the rules say — only reads need a public
// rule, since customers' browsers load the resulting image URL directly.
export async function uploadImageToStorage(
  base64Data: string,
  contentType: string,
  filename: string
): Promise<string> {
  const accessToken = await getGoogleAccessToken();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  const objectPath = `products/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(base64Data, 'base64');

  const uploadRes = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(firebaseStorageBucket)}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType || 'application/octet-stream',
      },
      body: buffer,
    }
  );

  if (!uploadRes.ok) {
    throw new Error(`Storage upload failed (HTTP ${uploadRes.status}): ${await uploadRes.text()}`);
  }

  // Attach a download token via the Firebase Storage REST API — this is the
  // same mechanism getDownloadURL() uses under the hood client-side, and
  // produces a URL that works as long as Storage Rules allow public reads.
  const token = crypto.randomUUID();
  const encodedPath = encodeURIComponent(objectPath);
  const patchRes = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseStorageBucket)}/o/${encodedPath}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata: { firebaseStorageDownloadTokens: token } }),
    }
  );

  if (!patchRes.ok) {
    throw new Error(`Could not finalize the uploaded image (HTTP ${patchRes.status}): ${await patchRes.text()}`);
  }

  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseStorageBucket)}/o/${encodedPath}?alt=media&token=${token}`;
}
