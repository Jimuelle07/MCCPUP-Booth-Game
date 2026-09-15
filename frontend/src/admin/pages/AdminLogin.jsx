import { useState } from 'react';
import { GatePillButton, MonoLabel, UnderlineLink } from '../../components/ui';
import { AuthCard, Banner, Divider, Field, GoogleButton } from '../components';
import { describeAuthError, useAuth } from '../AuthContext';

export default function AdminLogin({ navigate }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Admin sign in" navigate={navigate}>
      <MonoLabel>Booth admin access</MonoLabel>

      {error && (
        <div className="mt-16 md:mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-16 md:mt-3 flex flex-col gap-[17px] md:gap-[12px]">
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <UnderlineLink onClick={() => navigate('/admin/forgot-password')}>
            Forgot password?
          </UnderlineLink>
        </div>
        <GatePillButton type="submit" disabled={busy || !email.trim() || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </GatePillButton>
      </form>

      <div className="mt-16 md:mt-3">
        <Divider>or</Divider>
      </div>

      <GoogleButton onClick={onGoogle} disabled={busy}>
        Continue with Google
      </GoogleButton>

      <p className="mt-24 md:mt-6 text-center">
        <UnderlineLink onClick={() => navigate('/admin/signup')}>
          Need an admin account? Sign up
        </UnderlineLink>
      </p>
    </AuthCard>
  );
}
