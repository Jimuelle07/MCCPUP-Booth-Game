export function Screen({ children, onClick, className = '' }) {
  return (
    <main
      onClick={onClick}
      className={[
        'w-full flex flex-col items-center justify-center',
        'px-[17px] py-24 md:py-10',
        'text-[var(--kb-text)]',
        'min-h-screen overflow-y-auto md:h-screen md:min-h-0 md:overflow-hidden',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </main>
  );
}

export function BrandWordmark({ children, className = '' }) {
  return (
    <h1 className={["font-obviouslyvariable font-extrabold text-subheading leading-subheading tracking-subheading text-3d-accent uppercase", className].join(' ')}>
      {children}
    </h1>
  );
}

export function HeroHeadline({ children, size = 'sm', className = '' }) {
  const sizeClass =
    size === 'display'
      ? 'text-heading leading-heading tracking-heading'
      : size === 'lg'
        ? 'text-heading-lg leading-heading-lg tracking-heading-lg'
        : 'text-heading-sm leading-heading-sm tracking-heading-sm';

  return (
    <h2
      className={[
        'font-obviouslyvariable font-black uppercase',
        'text-3d',
        sizeClass,
        'break-words',
        className,
      ].join(' ')}
      style={{ fontFeatureSettings: '"calt" 0' }}
    >
      {children}
    </h2>
  );
}

export function GatePillButton({ children, type = 'button', disabled, onClick, className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={['key-pill', className].join(' ')}
    >
      {children}
    </button>
  );
}

export function OutlinedDisplayButton({ children, onClick, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={['key-pill-outline', className].join(' ')}
    >
      {children}
    </button>
  );
}

export function UnderlineLink({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-bergenmonoregular text-xs-2 leading-[0.8] text-[var(--kb-text-dim)] underline underline-offset-2 uppercase tracking-[0.05em] hover:text-[var(--kb-accent)]"
      style={{ fontFeatureSettings: '"calt" 0' }}
    >
      {children}
    </button>
  );
}

export function MonoTag({ children, variant = 'outline' }) {
  return (
    <span
      className={['key-tag', variant === 'fill' ? 'accent' : ''].join(' ')}
      style={{ fontFeatureSettings: '"calt" 0' }}
    >
      {children}
    </span>
  );
}

export function ConfettiCard({ children, color = 'pink', className = '' }) {
  return (
    <div className={['key-card', color === 'yellow' ? 'gold' : color, className].join(' ')}>
      {children}
    </div>
  );
}

export function DarkTextCard({ children, className = '' }) {
  return (
    <div className={['w-full max-w-[520px] key-panel text-left p-[17px]', className].join(' ')}>
      {children}
    </div>
  );
}

export function MonoLabel({ children }) {
  return (
    <span
      className="font-bergenmonoregular text-xs-2 leading-[0.8] uppercase tracking-[0.05em] text-[var(--kb-text-dim)]"
      style={{ fontFeatureSettings: '"calt" 0' }}
    >
      {children}
    </span>
  );
}

export function FloatingKey({ children, className = '', delay = 0 }) {
  return (
    <div
      className={['animate-key-pop-in', className].join(' ')}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Radial countdown pinned to the bottom-right corner during a round: the
// ring depletes in step with the real per-second timer.
export function RoundTimer({ seconds, total }) {
  const pct = Math.max(0, Math.min(1, seconds / total)) * 100;
  const urgent = seconds <= 3;

  return (
    <div
      className={['round-timer', urgent ? 'urgent' : ''].join(' ')}
      style={{ '--tp': `${pct}%` }}
      role="timer"
      aria-label={`${seconds} seconds left`}
    >
      <div className="round-timer-face">
        <span className="round-timer-value font-obviouslyvariable font-black">{seconds}</span>
        <span className="round-timer-unit font-bergenmonoregular">sec</span>
      </div>
    </div>
  );
}

// Exit affordance pinned to the top-left corner so a player can bail out of
// a session back to the attract screen at any time.
export function ExitButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="exit-button" aria-label="Exit game">
      <svg viewBox="0 0 16 16" className="exit-button-icon" aria-hidden="true">
        <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="font-bergenmonoregular">Exit</span>
    </button>
  );
}

function CrownIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 22"
      className={className}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 19 L1 6 L9 12.5 L16 2 L23 12.5 L31 6 L29 19 Z" />
    </svg>
  );
}

// Podium ranking for the attract screen's top 3: highest score sits tallest
// in the middle, 2nd on the right, 3rd on the left, like a bar-graph ranking.
export function PodiumRow({ entries }) {
  const [first, second, third] = entries;

  const columns = [
    { rank: 3, row: third, tone: 'green' },
    { rank: 1, row: first, tone: 'gold' },
    { rank: 2, row: second, tone: 'pink' },
  ].filter((col) => col.row);

  if (columns.length === 0) return null;

  return (
    <div className="podium-row">
      {columns.map((col, i) => (
        <div
          key={col.rank}
          className="podium-column animate-key-drop-in"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          {col.rank === 1 && <CrownIcon className="podium-crown" />}
          <span
            className="font-bergenmonoregular text-xs-2 leading-[0.8] uppercase tracking-[0.05em] text-center"
            style={{ fontFeatureSettings: '"calt" 0' }}
          >
            {col.row.name}
          </span>
          <span className="font-obviouslyvariable font-black text-body-lg leading-body-lg">
            {col.row.score}{col.row.rounds ? `/${col.row.rounds}` : ''}
          </span>
          <div className={['podium-base', `podium-base--${col.tone}`, `podium-h-${col.rank}`].join(' ')}>
            <span className="podium-rank-number">{col.rank}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
