import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';

// On Cloud Run this picks up Application Default Credentials for the
// service's own identity automatically — no key file needed. Locally,
// set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON path.
let auth = null;
let initError = null;

try {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credential = keyPath && fs.existsSync(keyPath) ? cert(keyPath) : applicationDefault();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || undefined;

  const app = getApps()[0] ?? initializeApp({ credential, projectId });
  auth = getAuth(app);
} catch (err) {
  initError = err;
}

export const firebaseAdminConfigured = Boolean(auth);
export const firebaseAdminInitError = initError;
export const adminAuth = auth;
