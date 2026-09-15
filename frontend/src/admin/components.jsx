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

export function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label
        htmlFor={id}
        className="font-degulardisplay-bold font-bold text-body leading-body tracking-[0.05em] uppercase text-[var(--kb-text)]"
      >
        {label}
      </label>
      <input id={id} className="key-input" {...inputProps} />
      {error && <p className="field-error font-bergenmonoregular">{error}</p>}
    </div>
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

export function Divider({ children }) {
  return (
    <div className="auth-divider">
      <span />
      <span className="font-bergenmonoregular">{children}</span>
      <span />
    </div>
  );
}

export function GoogleButton({ onClick, disabled, children }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="key-pill-outline auth-oauth-button">
      <GoogleGIcon />
      {children}
    </button>
  );
}

function GoogleGIcon() {
  return (
    <svg viewBox="0 0 18 18" className="auth-oauth-icon" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
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
