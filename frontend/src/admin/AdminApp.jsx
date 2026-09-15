import { useEffect, useState } from 'react';
import { MonoTag, Screen } from '../components/ui';
import { AuthProvider, useAuth } from './AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminSignUp from './pages/AdminSignUp';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

// Small dependency-free router for the /admin area, matching the rest of
// this app's preference for a hand-rolled state machine over a routing
// library for a handful of screens.
function normalizePath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/admin';
  return path === '/admin' ? '/admin/login' : path;
}

export default function AdminApp() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    function onPopState() {
      setPath(normalizePath(window.location.pathname));
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(to) {
    window.history.pushState({}, '', to);
    setPath(normalizePath(to));
  }

  return (
    <AuthProvider>
      <AdminRoutes path={path} navigate={navigate} />
    </AuthProvider>
  );
}

function AdminRoutes({ path, navigate }) {
  const { user, loading, configured } = useAuth();

  useEffect(() => {
    if (!configured || loading) return;
    const isAuthPage = ['/admin/login', '/admin/signup', '/admin/forgot-password'].includes(path);
    if (user && isAuthPage) navigate('/admin/dashboard');
    if (!user && path === '/admin/dashboard') navigate('/admin/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, configured, path]);

  if (!configured) {
    return (
      <Screen>
        <MonoTag>Admin auth not configured</MonoTag>
        <p className="mt-16 md:mt-3 font-bergenmonoregular text-body leading-body text-[var(--kb-text-dim)] max-w-[480px] text-center">
          Set the VITE_FIREBASE_* environment variables (see frontend/.env.example) and rebuild to enable the admin area.
        </p>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <MonoTag>Loading admin session&hellip;</MonoTag>
      </Screen>
    );
  }

  if (path === '/admin/signup') return <AdminSignUp navigate={navigate} />;
  if (path === '/admin/forgot-password') return <AdminForgotPassword navigate={navigate} />;
  if (path === '/admin/dashboard') {
    return user ? <AdminDashboard navigate={navigate} /> : null;
  }
  return <AdminLogin navigate={navigate} />;
}
