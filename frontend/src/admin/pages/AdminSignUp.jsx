import { useState } from 'react';
import { GatePillButton, MonoLabel, UnderlineLink } from '../../components/ui';
import { AuthCard, Banner } from '../components';
import { describeAuthError, isUserCancelled, useAuth } from '../AuthContext';

export default function AdminSignUp({ navigate }) {
  const { signInOrSignUp } = useAuth();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onContinue() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await signInOrSignUp();
    } catch (err) {
      if (!isUserCancelled(err)) setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Create admin account" navigate={navigate}>
      <MonoLabel>Booth admin access</MonoLabel>

      <p className="mt-8 md:mt-2 font-bergenmonoregular text-caption leading-caption text-[var(--kb-text-dim)]">
        Azure AD B2C handles account creation on its own secure page &mdash;
        look for &ldquo;Sign up now&rdquo; there. New accounts can sign in
        right away but need approval before the dashboard unlocks.
      </p>

      {error && (
        <div className="mt-16 md:mt-3">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <div className="mt-24 md:mt-6 flex flex-col gap-[17px] md:gap-[12px]">
        <GatePillButton onClick={onContinue} disabled={busy}>
          {busy ? 'Opening sign-up…' : 'Continue to sign up'}
        </GatePillButton>
      </div>

      <p className="mt-24 md:mt-6 text-center">
        <UnderlineLink onClick={() => navigate('/admin/login')}>
          Already have an account? Sign in
        </UnderlineLink>
      </p>
    </AuthCard>
  );
}
