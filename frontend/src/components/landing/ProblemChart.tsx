import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FeederTimeseriesPoint } from '../../types/api'

const W = 640
const H = 240
const PAD_L = 8
const PAD_R = 8
const PAD_T = 16
const PAD_B = 28

function pathFor(values: number[], max: number) {
  const n = values.length
  if (n < 2) return ''
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const pts = values.map((v, i) => {
    const x = PAD_L + (i / (n - 1)) * innerW
    const y = PAD_T + innerH - (max > 0 ? (v / max) * innerH : 0)
    return [x, y] as const
  })
  return pts.reduce((d, [x, y], i) => d + `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `, '')
}

/** A real 24-hour "demand vs. renewable availability" trace, drawn from the same modeled
 *  timeseries used everywhere else in the app (net_demand_w / renewable_w, both watts, plotted
 *  on a shared scale so they're directly comparable). The "stress window" band marks hours the
 *  controller itself flagged as non-NORMAL -- never a guessed or invented region. */
export function ProblemChart({ points }: { points: FeederTimeseriesPoint[] }) {
  const { demandPath, renewPath, stressBand, hourLabels } = useMemo(() => {
    if (points.length < 2) return { demandPath: '', renewPath: '', stressBand: null as null | { x1: number; x2: number }, hourLabels: [] as string[] }
    const demand = points.map((p) => p.net_demand_w)
    const renew = points.map((p) => p.renewable_w)
    const maxV = Math.max(...demand, ...renew) * 1.08
    const innerW = W - PAD_L - PAD_R
    const stressIdx = points
      .map((p, i) => (p.event_state !== 'NORMAL' ? i : -1))
      .filter((i) => i >= 0)
    const stressBand = stressIdx.length
      ? { x1: PAD_L + (Math.min(...stressIdx) / (points.length - 1)) * innerW, x2: PAD_L + (Math.max(...stressIdx) / (points.length - 1)) * innerW }
      : null
    const hourLabels = points
      .filter((_, i) => i % 6 === 0)
      .map((p) => new Date(p.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }) + ':00')
    return { demandPath: pathFor(demand, maxV), renewPath: pathFor(renew, maxV), stressBand, hourLabels }
  }, [points])

  if (!demandPath) {
    return <div className="ff-neu-inset flex h-[240px] items-center justify-center text-[13px] text-[var(--ff-ink-faint)]">Loading modeled 24-hour trace…</div>
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible">
        {stressBand && (
          <g>
            <rect x={stressBand.x1} y={PAD_T} width={Math.max(4, stressBand.x2 - stressBand.x1)} height={H - PAD_T - PAD_B} fill="var(--ff-warn)" opacity={0.1} />
            <text x={(stressBand.x1 + stressBand.x2) / 2} y={PAD_T + 14} textAnchor="middle" className="ff-mono" fontSize="9" fontWeight="600" letterSpacing="0.05em" fill="#8A6420">
              STRESS WINDOW
            </text>
          </g>
        )}

        {/* Baseline grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD_L} x2={W - PAD_R} y1={PAD_T + (H - PAD_T - PAD_B) * f} y2={PAD_T + (H - PAD_T - PAD_B) * f} stroke="var(--ff-line)" strokeDasharray="2 4" />
        ))}

        <motion.path
          d={renewPath} fill="none" stroke="var(--ff-energy)" strokeWidth={2.5} strokeLinecap="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
        <motion.path
          d={demandPath} fill="none" stroke="var(--ff-critical)" strokeWidth={2.75} strokeLinecap="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, delay: 0.15, ease: 'easeInOut' }}
        />

        {hourLabels.map((label, i) => (
          <text key={label + i} x={PAD_L + (i * 6 / (points.length - 1)) * (W - PAD_L - PAD_R)} y={H - 8} textAnchor="middle" className="ff-mono" fontSize="9" fill="var(--ff-ink-faint)">
            {label}
          </text>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-5">
        <Legend color="var(--ff-critical)" label="DEMAND" />
        <Legend color="var(--ff-energy)" label="RENEWABLE AVAILABILITY" />
        <span className="ff-mono ml-auto text-[10px] text-[var(--ff-ink-faint)]">First 24 modeled hours · watts</span>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="ff-mono inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--ff-ink-dim)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
