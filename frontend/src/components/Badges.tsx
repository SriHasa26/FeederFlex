import type { EventState } from '../types/api'

export function EvidenceBadge({ evidenceClass }: { evidenceClass: 'A' | 'B' }) {
  if (evidenceClass === 'A') {
    return (
      <span
        className="ff-mono inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-wide"
        style={{ borderColor: 'rgba(31,92,69,0.35)', background: 'rgba(143,191,122,0.14)', color: 'var(--ff-primary)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--ff-primary)' }} />
        EVIDENCE-BACKED
      </span>
    )
  }
  return (
    <span
      className="ff-mono inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-wide"
      style={{ borderColor: 'rgba(184,118,58,0.4)', background: 'rgba(184,118,58,0.12)', color: 'var(--ff-counterfactual)' }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--ff-counterfactual)' }} />
      COUNTERFACTUAL · ILLUSTRATIVE
    </span>
  )
}

const EVENT_STATE_STYLE: Record<EventState, { color: string; bg: string; border: string; label: string }> = {
  NORMAL: { color: 'var(--ff-ink-dim)', bg: 'rgba(82,96,87,0.08)', border: 'rgba(82,96,87,0.25)', label: 'NORMAL' },
  WATCH: { color: '#8A6420', bg: 'rgba(216,155,69,0.14)', border: 'rgba(216,155,69,0.4)', label: 'WATCH' },
  SHORTFALL: { color: '#9A4A2E', bg: 'rgba(200,92,74,0.13)', border: 'rgba(200,92,74,0.4)', label: 'SHORTFALL' },
  INSUFFICIENT_FLEXIBILITY: { color: '#8B2E20', bg: 'rgba(200,92,74,0.20)', border: 'rgba(200,92,74,0.55)', label: 'INSUFFICIENT FLEXIBILITY' },
  RESTORING: { color: '#2E5A82', bg: 'rgba(76,126,168,0.12)', border: 'rgba(76,126,168,0.35)', label: 'RESTORING' },
}

export function EventStateBadge({ state, size = 'md' }: { state: EventState; size?: 'sm' | 'md' | 'lg' }) {
  const s = EVENT_STATE_STYLE[state] ?? EVENT_STATE_STYLE.NORMAL
  const sizeCls = size === 'lg' ? 'px-4 py-2 text-sm' : size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs'
  const pulse = state === 'INSUFFICIENT_FLEXIBILITY' || state === 'SHORTFALL'
  return (
    <span
      className={`ff-mono inline-flex items-center gap-2 rounded-md border font-semibold tracking-wide ${sizeCls}`}
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      <span className={`h-2 w-2 rounded-full ${pulse ? 'ff-pulse' : ''}`} style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

export function NotEstablishedBadge() {
  return (
    <span
      className="ff-mono inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-wide"
      style={{ borderColor: 'var(--ff-line-strong)', background: 'var(--ff-surface-sunken)', color: 'var(--ff-ink-dim)' }}
    >
      NOT ESTABLISHED
    </span>
  )
}
