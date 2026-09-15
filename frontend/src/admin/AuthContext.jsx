import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, firebaseConfigured, googleProvider } from '../lib/firebase';

const AuthContext = createContext(null);

// Admin auth state for the /admin area, backed by GCP Identity Platform
// (Firebase Authentication). Being signed in only proves identity; the API
// separately checks for admin access on every protected request.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value = {
    user,
    loading,
    configured: firebaseConfigured,
    async login(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    async signup(email, password) {
      await createUserWithEmailAndPassword(auth, email, password);
    },
    async loginWithGoogle() {
      await signInWithPopup(auth, googleProvider);
    },
    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email);
    },
    async logout() {
      await signOut(auth);
    },
    async getIdToken() {
      return auth.currentUser ? auth.currentUser.getIdToken() : null;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Maps Firebase's auth/* error codes to copy that names the problem and the
// recovery, instead of surfacing the raw SDK error string.
export function describeAuthError(err) {
  const code = err?.code || '';

  // Firebase sometimes folds the server's own error text into the code for
  // this one case (e.g. "auth/api-key-not-valid.-please-pass-a-valid-api-key."),
  // so match by prefix instead of equality.
  if (code.startsWith('auth/api-key-not-valid') || code === 'auth/invalid-api-key' || code === 'auth/configuration-not-found') {
    return 'Admin sign-in isn’t configured correctly for this deployment. Tell whoever set up GCP Identity Platform.';
  }

  switch (code) {
    case 'auth/invalid-email':
      return 'That email address doesn’t look right. Double-check it and try again.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'That email and password don’t match an admin account.';
    case 'auth/email-already-in-use':
      return 'An account already exists for that email. Try logging in instead.';
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before it finished.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
