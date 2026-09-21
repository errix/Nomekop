type IconProps = {
  size?: number;
};

export function IconClose({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function IconHelp({ size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconFullscreen({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

/** Chevron / back-arrow — not the literal "<" text character. */
export function IconBack({ size = 22 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/**
 * D1 rev3 owned mark: filled Poké Ball in standard orientation
 * (red top / white bottom).
 */
export function IconOwnedBall({ size = 14 }: IconProps) {
  return (
    <svg
      className="ownership-ball"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7.15" fill="#f4f4f5" />
      <path d="M1.05 8a6.95 6.95 0 0 1 13.9 0Z" fill="#e3350d" />
      <rect x="1" y="7.05" width="14" height="1.9" fill="#16151a" />
      <circle cx="8" cy="8" r="2.35" fill="#16151a" />
      <circle cx="8" cy="8" r="1.2" fill="#f4f4f5" />
    </svg>
  );
}

/** D1 rev3 catalog-only mark: empty ring. */
export function IconUnownedRing({ size = 14 }: IconProps) {
  return (
    <svg
      className="ownership-ring"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.55" />
    </svg>
  );
}
