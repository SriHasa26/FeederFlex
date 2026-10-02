/** Small custom mark: a transformer node feeding three household nodes -- used as the wordmark
 * icon in the navbar and favicon-adjacent branding. Deliberately not a generic bolt/lightning
 * icon. */
export function GridMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="8" r="4" fill="var(--ff-primary)" />
      <path d="M16 12V17" stroke="var(--ff-primary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 17H8M16 17H16M16 17H24" stroke="var(--ff-secondary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17V23M16 17V23M24 17V23" stroke="var(--ff-secondary)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="25" r="2.4" fill="var(--ff-energy)" />
      <circle cx="16" cy="25" r="2.4" fill="var(--ff-energy)" />
      <circle cx="24" cy="25" r="2.4" fill="var(--ff-energy)" />
    </svg>
  )
}
