import { useState } from 'react';
import { GatePillButton, MonoLabel, UnderlineLink } from '../../components/ui';
import { AuthCard, Banner } from '../components';
import { describeAuthError, isForgotPasswordRedirect, isUserCancelled, useAuth } from '../AuthContext';

export default function AdminLogin({ navigate }) {
  const { signInOrSignUp, resetPassword } = useAuth();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSignIn() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await signInOrSignUp();
    } catch (err) {
      if (isUserCancelled(err)) {
        // Closed the popup on purpose — nothing to report.
      } else if (isForgotPasswordRedirect(err)) {
        try {
          await resetPassword();
        } catch (resetErr) {
          if (!isUserCancelled(resetErr)) setError(describeAuthError(resetErr));
        }
      } else {
        setError(describeAuthError(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Admin sign in" navigate={navigate}>
      <MonoLabel>Booth admin access</MonoLabel>

      <p className="mt-8 md:mt-2 font-bergenmonoregular text-caption leading-caption text-[var(--kb-text-dim)]">
        Sign-in, account creation, and password reset all happen on Microsoft&rsquo;s
        secure Azure AD B2C page &mdash; nothing you type here ever touches this app directly.
      </p>

      {error && (
        <div className="mt-16 md:mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <div className="mt-24 md:mt-6 flex flex-col gap-[17px] md:gap-[12px]">
        <GatePillButton onClick={onSignIn} disabled={busy}>
          {busy ? 'Opening sign-in…' : 'Sign in'}
        </GatePillButton>
      </div>

      <p className="mt-24 md:mt-6 flex flex-col items-center gap-[10px]">
        <UnderlineLink onClick={() => navigate('/admin/forgot-password')}>
          Forgot password?
        </UnderlineLink>
        <UnderlineLink onClick={() => navigate('/admin/signup')}>
          Need an admin account? Sign up
        </UnderlineLink>
      </p>
    </AuthCard>
  );
}
