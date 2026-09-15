import { useState } from 'react';
import { GatePillButton, MonoLabel, UnderlineLink } from '../../components/ui';
import { AuthCard, Banner, Field } from '../components';
import { describeAuthError, useAuth } from '../AuthContext';

export default function AdminForgotPassword({ navigate }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      // Firebase reports "user-not-found" here; treat it the same as
      // success so this form can't be used to enumerate admin emails.
      if (err?.code === 'auth/user-not-found') {
        setSent(true);
      } else {
        setError(describeAuthError(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Reset password" navigate={navigate}>
      <MonoLabel>Booth admin access</MonoLabel>

      {sent ? (
        <div className="mt-16 md:mt-3">
          <Banner tone="success">
            If {email.trim() || 'that address'} has an admin account, a reset link is on its way.
          </Banner>
          <GatePillButton className="mt-24 md:mt-6" onClick={() => navigate('/admin/login')}>
            Back to sign in
          </GatePillButton>
        </div>
      ) : (
        <>
          <p className="mt-8 md:mt-2 font-bergenmonoregular text-caption leading-caption text-[var(--kb-text-dim)]">
            Enter your admin email and we&rsquo;ll send a link to set a new password.
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
            <GatePillButton type="submit" disabled={busy || !email.trim()}>
              {busy ? 'Sending…' : 'Send reset link'}
            </GatePillButton>
          </form>
        </>
      )}

      <p className="mt-24 md:mt-6 text-center">
        <UnderlineLink onClick={() => navigate('/admin/login')}>
          Back to sign in
        </UnderlineLink>
      </p>
    </AuthCard>
  );
}
