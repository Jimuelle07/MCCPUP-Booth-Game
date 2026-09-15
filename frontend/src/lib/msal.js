import { PublicClientApplication } from '@azure/msal-browser';

// Azure AD B2C (Microsoft Entra External ID) config for the admin area.
// B2C hosts the actual sign-in / sign-up / password-reset pages itself, so
// this client only ever needs the tenant + policy names, never a secret.
const tenantName = import.meta.env.VITE_AZURE_B2C_TENANT_NAME;
const clientId = import.meta.env.VITE_AZURE_B2C_CLIENT_ID;
const signInPolicy = import.meta.env.VITE_AZURE_B2C_SIGNIN_POLICY || 'B2C_1_susi';
const resetPolicy = import.meta.env.VITE_AZURE_B2C_RESET_POLICY || 'B2C_1_reset';

export const msalConfigured = Boolean(tenantName && clientId);

const authorityDomain = tenantName ? `${tenantName}.b2clogin.com` : '';
const authorityBase = tenantName ? `https://${authorityDomain}/${tenantName}.onmicrosoft.com` : '';

// One combined "sign up or sign in" policy (B2C's current recommended
// setup — there is no separate first-class sign-up-only policy) plus a
// dedicated password-reset policy for the "Forgot password?" link.
export const b2cPolicies = {
  signInAuthority: `${authorityBase}/${signInPolicy}`,
  resetAuthority: `${authorityBase}/${resetPolicy}`,
};

export const loginRequest = { scopes: ['openid', 'offline_access'] };

export const msalInstance = msalConfigured
  ? new PublicClientApplication({
      auth: {
        clientId,
        authority: b2cPolicies.signInAuthority,
        knownAuthorities: [authorityDomain],
        redirectUri: import.meta.env.VITE_AZURE_B2C_REDIRECT_URI || `${window.location.origin}/admin/dashboard`,
      },
      cache: { cacheLocation: 'sessionStorage', storeAuthStateInCookie: false },
    })
  : null;
