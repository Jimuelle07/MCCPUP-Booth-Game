import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Azure AD B2C tokens are standard OIDC JWTs, so verification here is just
// "check the signature against the tenant's published public keys" — no
// Azure SDK or service credential needed, which makes this the same code
// locally and on Azure Container Apps.
const tenantName = process.env.AZURE_B2C_TENANT_NAME;
const clientId = process.env.AZURE_B2C_CLIENT_ID;
const policy = process.env.AZURE_B2C_SIGNIN_POLICY || 'B2C_1_susi';

export const azureAuthConfigured = Boolean(tenantName && clientId);

const issuer = tenantName
  ? `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policy}/v2.0/`
  : null;

const jwks = azureAuthConfigured
  ? jwksClient({
      jwksUri: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policy}/discovery/v2.0/keys`,
      cache: true,
      rateLimit: true,
    })
  : null;

function getSigningKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

// Verifies an Azure AD B2C ID token and resolves with its decoded claims.
export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    if (!azureAuthConfigured) {
      reject(new Error('Azure auth is not configured.'));
      return;
    }
    jwt.verify(token, getSigningKey, { audience: clientId, issuer }, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}
