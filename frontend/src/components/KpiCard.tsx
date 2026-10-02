import { useId } from 'react'

type Accent = 'neutral' | 'teal' | 'amber' | 'red'

const ACCENT_COLOR: Record<Accent, string> = {
  neutral: 'var(--ff-ink)',
  teal: 'var(--ff-primary)',
  amber: 'var(--ff-warn)',
  red: 'var(--ff-critical)',
}

export function KpiCard({
  label, value, sub, accent = 'neutral', delta, sparkline, icon,
}: {
  label: string
  value: string
  sub?: string
  accent?: Accent
  /** Optional signed delta, e.g. "+8.4%" -- rendered with an up/down glyph. */
  delta?: string
  /** Optional small series to render as a sparkline beneath the value. */
  sparkline?: number[]
  icon?: React.ReactNode
}) {
  const color = ACCENT_COLOR[accent]
  const positive = delta ? !delta.trim().startsWith('-') : undefined

  return (
    <div className="ff-card ff-fade-in relative flex flex-col gap-2 overflow-hidden p-4">
      {icon && <span className="absolute right-4 top-4" style={{ color: 'var(--ff-secondary)' }}>{icon}</span>}
      {/* Label is a direct child of the card (not a nested row) so that E2E locators walking
          from the label to its parent still reach the value below -- see smoke.spec.ts test 3. */}
      <span className="ff-mono pr-5 text-[10.5px] uppercase tracking-[0.08em] text-[var(--ff-ink-faint)]">{label}</span>

      <div className="flex items-baseline gap-2">
        <span className="ff-mono text-[26px] font-semibold leading-none tabular-nums" style={{ color }}>
          {value}
        </span>
        {delta && (
          <span
            className="ff-mono flex items-center gap-0.5 text-[11px] font-medium"
            style={{ color: positive ? 'var(--ff-primary)' : 'var(--ff-critical)' }}
          >
            {positive ? '▲' : '▼'} {delta.replace(/^[+-]/, '')}
          </span>
        )}
      </div>

      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} color={color} />}

      {sub && <span className="text-[12px] text-[var(--ff-ink-dim)]">{sub}</span>}
    </div>
  )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const id = useId()
  const w = 120
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const path = `M${points.join(' L')}`
  const areaPath = `${path} L${w},${h} L0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="mt-0.5">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
