import { useState } from 'react';
import { GatePillButton, MonoLabel, UnderlineLink } from '../../components/ui';
import { AuthCard, Banner, Divider, Field, GoogleButton } from '../components';
import { describeAuthError, useAuth } from '../AuthContext';

export default function AdminSignUp({ navigate }) {
  const { signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setConfirmError(null);

    if (password !== confirm) {
      setConfirmError('Passwords don’t match.');
      return;
    }

    setBusy(true);
    try {
      await signup(email.trim(), password);
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
    <AuthCard title="Create admin account" navigate={navigate}>
      <MonoLabel>Booth admin access</MonoLabel>

      <p className="mt-8 md:mt-2 font-bergenmonoregular text-caption leading-caption text-[var(--kb-text-dim)]">
        New accounts can sign in right away but need approval before the dashboard unlocks.
      </p>

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
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          error={confirmError}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (confirmError) setConfirmError(null);
          }}
        />
        <GatePillButton type="submit" disabled={busy || !email.trim() || !password || !confirm}>
          {busy ? 'Creating account…' : 'Create account'}
        </GatePillButton>
      </form>

      <div className="mt-16 md:mt-3">
        <Divider>or</Divider>
      </div>

      <GoogleButton onClick={onGoogle} disabled={busy}>
        Continue with Google
      </GoogleButton>

      <p className="mt-24 md:mt-6 text-center">
        <UnderlineLink onClick={() => navigate('/admin/login')}>
          Already have an account? Sign in
        </UnderlineLink>
      </p>
    </AuthCard>
  );
}
