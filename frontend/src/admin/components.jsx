import { BrandWordmark, DarkTextCard, ExitButton, Screen } from '../components/ui';

// Shared chrome for every /admin auth screen: brand, a way back to the
// booth game, and a centered panel that matches the keyboard-arcade world.
export function AuthCard({ title, children, navigate }) {
  return (
    <Screen>
      <ExitButton onClick={() => (navigate ? navigate('/') : window.location.assign('/'))} />
      <BrandWordmark className="mb-24 md:mb-6">{title}</BrandWordmark>
      <DarkTextCard>{children}</DarkTextCard>
    </Screen>
  );
}

export function Banner({ tone = 'error', children }) {
  return (
    <div className={['auth-banner', `auth-banner--${tone}`].join(' ')} role={tone === 'error' ? 'alert' : 'status'}>
      {tone === 'error' ? <AlertIcon /> : <CheckIcon />}
      <span className="font-bergenmonoregular">{children}</span>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" className="auth-banner-icon" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5.5v5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="auth-banner-icon" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.2 10.3 8.8 13l5-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
