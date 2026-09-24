/** Small stroke-based nav icons — deliberately plain/minimal (no icon
 * library dependency), matching the hamburger icon's existing style.
 * All take a className so callers control size/color. */

type IconProps = { className?: string };

export function FeedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 6h16M4 12h10M4 18h13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PodsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M14.5 19c.4-2 1.7-3.5 3.3-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WantToTryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 4.5h12a.5.5 0 0 1 .5.5v14.2c0 .4-.45.63-.78.4L12 15.5l-5.72 4.1c-.33.23-.78 0-.78-.4V5a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20l-4.35-4.35" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
