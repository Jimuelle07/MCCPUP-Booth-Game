import { adminAuth, firebaseAdminConfigured } from '../firebaseAdmin.js';

// Bootstrap allow-list: an admin becomes fully authorized once their email
// is added to ADMIN_EMAILS (comma-separated) or their Firebase account has
// the `admin: true` custom claim set. The allow-list lets the very first
// admin get in before anyone has claims to grant.
function isAllowedEmail(email) {
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email) && list.includes(email.toLowerCase());
}

// Verifies the Firebase ID token on `Authorization: Bearer <token>` and
// requires the account to be an approved admin (allow-list or custom
// claim). Responds 503 if GCP Identity Platform isn't configured yet, 401
// if the token is missing/invalid, 403 if the account isn't approved.
export async function requireAdmin(req, res, next) {
  if (!firebaseAdminConfigured) {
    return res.status(503).json({ error: 'Admin auth is not configured on this deployment.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token.' });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  if (decoded.admin !== true && !isAllowedEmail(decoded.email)) {
    return res.status(403).json({ error: 'This account is not an approved admin.' });
  }

  req.admin = { uid: decoded.uid, email: decoded.email };
  next();
}
