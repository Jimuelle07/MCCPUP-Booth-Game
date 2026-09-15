import { useEffect, useState } from 'react';
import { GatePillButton, MonoLabel, MonoTag, OutlinedDisplayButton } from '../../components/ui';
import { AuthCard, Banner } from '../components';
import { useAuth } from '../AuthContext';

// STATUS.checking -> STATUS.granted | STATUS.pending | STATUS.error, based
// on whether the API's admin allow-list/custom-claim check accepts this
// signed-in account.
const STATUS = { CHECKING: 'checking', GRANTED: 'granted', PENDING: 'pending', ERROR: 'error' };

export default function AdminDashboard({ navigate }) {
  const { user, getIdToken, logout } = useAuth();
  const [status, setStatus] = useState(STATUS.CHECKING);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      setStatus(STATUS.CHECKING);
      try {
        const token = await getIdToken();
        const res = await fetch('/api/admin/whoami', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (res.status === 403) setStatus(STATUS.PENDING);
        else if (res.ok) setStatus(STATUS.GRANTED);
        else setStatus(STATUS.ERROR);
      } catch {
        if (!cancelled) setStatus(STATUS.ERROR);
      }
    }

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, [getIdToken]);

  return (
    <AuthCard title="Admin dashboard" navigate={navigate}>
      <MonoLabel>Signed in as</MonoLabel>
      <p className="mt-4 md:mt-2 font-degularvariable text-body leading-body text-[var(--kb-text)] break-all">
        {user?.email}
      </p>

      <div className="mt-16 md:mt-3">
        {status === STATUS.CHECKING && <MonoTag>Checking admin access&hellip;</MonoTag>}
        {status === STATUS.GRANTED && <Banner tone="success">Admin access granted.</Banner>}
        {status === STATUS.PENDING && (
          <Banner tone="error">
            This account isn&rsquo;t on the admin allow-list yet. Ask an existing admin to grant access.
          </Banner>
        )}
        {status === STATUS.ERROR && (
          <Banner tone="error">Couldn&rsquo;t reach the admin API. Try again shortly.</Banner>
        )}
      </div>

      <div className="mt-24 md:mt-6 flex flex-col gap-[17px] md:gap-[12px]">
        <OutlinedDisplayButton onClick={() => logout().then(() => navigate('/admin/login'))}>
          Sign out
        </OutlinedDisplayButton>
        <GatePillButton onClick={() => navigate('/')}>
          Back to booth game
        </GatePillButton>
      </div>
    </AuthCard>
  );
}
