export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div>
      {eyebrow && (
        <span className="ff-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--ff-secondary)' }}>
          {eyebrow}
        </span>
      )}
      <h1 className="ff-display mt-1 text-[24px] font-extrabold text-[var(--ff-ink)]">{title}</h1>
      {subtitle && <p className="mt-1 max-w-2xl text-[13.5px] text-[var(--ff-ink-dim)]">{subtitle}</p>}
    </div>
  )
}
