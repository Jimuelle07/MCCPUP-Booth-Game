import { createContext, useContext, useEffect, useState } from 'react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { b2cPolicies, loginRequest, msalConfigured, msalInstance } from '../lib/msal';

const AuthContext = createContext(null);

// Azure AD B2C owns the actual sign-in / sign-up / password-reset UI (its
// own hosted, brandable page) — this context just drives the popup and
// tracks whichever account comes back. See docs/deployment.md for the B2C
// tenant + user-flow setup this depends on.
export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(msalConfigured);

  useEffect(() => {
    if (!msalConfigured) return undefined;
    let cancelled = false;

    msalInstance
      .initialize()
      .then(() => msalInstance.handleRedirectPromise())
      .then(() => {
        if (cancelled) return;
        const active = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
        if (active) msalInstance.setActiveAccount(active);
        setAccount(active);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = {
    account,
    loading,
    configured: msalConfigured,

    // Drives both the login page and the sign-up page: B2C's combined
    // policy shows a "create one now" link for new users inside its own
    // hosted screen, so there is no separate sign-up API call to make.
    async signInOrSignUp() {
      const result = await msalInstance.loginPopup(loginRequest);
      msalInstance.setActiveAccount(result.account);
      setAccount(result.account);
    },

    async resetPassword() {
      const result = await msalInstance.loginPopup({ ...loginRequest, authority: b2cPolicies.resetAuthority });
      msalInstance.setActiveAccount(result.account);
      setAccount(result.account);
    },

    async logout() {
      await msalInstance.logoutPopup();
      setAccount(null);
    },

    async getIdToken() {
      if (!account) return null;
      try {
        const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
        return result.idToken;
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          const result = await msalInstance.acquireTokenPopup(loginRequest);
          return result.idToken;
        }
        throw err;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// B2C's documented pattern for a "Forgot password?" link placed inside the
// combined sign-in policy itself: it doesn't reset the password there, it
// cancels sign-in with this specific error so the app can redirect into the
// dedicated reset policy. See Microsoft's B2C sample apps for the same check.
export function isForgotPasswordRedirect(err) {
  return String(err?.errorMessage || '').includes('AADB2C90118');
}

export function isUserCancelled(err) {
  return err?.errorCode === 'user_cancelled';
}

// Maps msal-browser's error codes to copy that names the problem and the
// recovery, instead of surfacing the raw MSAL error string.
export function describeAuthError(err) {
  switch (err?.errorCode) {
    case 'popup_window_error':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.';
    case 'interaction_in_progress':
      return 'A sign-in window is already open. Finish or close it, then try again.';
    case 'monitor_window_timeout':
    case 'user_timeout_reached':
      return 'That took too long and timed out. Try again.';
    case 'network_error':
      return 'Network error — check your connection and try again.';
    case 'invalid_client':
    case 'unauthorized_client':
      return 'Admin sign-in isn’t configured correctly for this deployment. Tell whoever set up Azure AD B2C.';
    default:
      return 'Something went wrong signing in. Please try again.';
  }
}
