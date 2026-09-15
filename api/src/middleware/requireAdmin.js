import { azureAuthConfigured, verifyToken } from '../azureAuth.js';

// Admin allow-list: an account is authorized once its email is added to
// ADMIN_EMAILS (comma-separated). Azure AD B2C's default user flows don't
// carry custom roles/claims without extra App Roles setup, so the
// allow-list is the primary access check here (see docs/deployment.md for
// the App Roles upgrade path if you outgrow it).
function isAllowedEmail(email) {
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email) && list.includes(email.toLowerCase());
}

function claimEmail(decoded) {
  return decoded.emails?.[0] || decoded.email || decoded.preferred_username;
}

// Verifies the Azure AD B2C ID token on `Authorization: Bearer <token>` and
// requires the account's email to be on the admin allow-list. Responds 503
// if B2C isn't configured yet, 401 if the token is missing/invalid, 403 if
// the account isn't approved.
export async function requireAdmin(req, res, next) {
  if (!azureAuthConfigured) {
    return res.status(503).json({ error: 'Admin auth is not configured on this deployment.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token.' });
  }

  let decoded;
  try {
    decoded = await verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const email = claimEmail(decoded);
  if (!isAllowedEmail(email)) {
    return res.status(403).json({ error: 'This account is not an approved admin.' });
  }

  req.admin = { email };
  next();
}
