import { useState } from 'react';
import { GatePillButton, MonoLabel, UnderlineLink } from '../../components/ui';
import { AuthCard, Banner } from '../components';
import { describeAuthError, isUserCancelled, useAuth } from '../AuthContext';

export default function AdminForgotPassword({ navigate }) {
  const { resetPassword } = useAuth();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onReset() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await resetPassword();
      navigate('/admin/dashboard');
    } catch (err) {
      if (!isUserCancelled(err)) setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Reset password" navigate={navigate}>
      <MonoLabel>Booth admin access</MonoLabel>

      <p className="mt-8 md:mt-2 font-bergenmonoregular text-caption leading-caption text-[var(--kb-text-dim)]">
        Azure AD B2C will ask for your admin email, send a verification
        code, and let you set a new password &mdash; all on its own secure page.
      </p>

      {error && (
        <div className="mt-16 md:mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <div className="mt-24 md:mt-6 flex flex-col gap-[17px] md:gap-[12px]">
        <GatePillButton onClick={onReset} disabled={busy}>
          {busy ? 'Opening reset…' : 'Reset password'}
        </GatePillButton>
      </div>

      <p className="mt-24 md:mt-6 text-center">
        <UnderlineLink onClick={() => navigate('/admin/login')}>
          Back to sign in
        </UnderlineLink>
      </p>
    </AuthCard>
  );
}
