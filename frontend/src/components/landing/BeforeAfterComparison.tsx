import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { FeederKPIs, FeederTimeseriesPoint } from '../../types/api'
import { formatPct, formatWh } from '../../utils/format'

const W = 640
const H = 220
const PAD_L = 8
const PAD_R = 8
const PAD_T = 12
const PAD_B = 10

function pathFor(values: number[], max: number) {
  const n = values.length
  if (n < 2) return ''
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  return values
    .map((v, i) => {
      const x = PAD_L + (i / (n - 1)) * innerW
      const y = PAD_T + innerH - (max > 0 ? (v / max) * innerH : 0)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export interface BeforeAfterComparisonProps {
  pointsBaseline: FeederTimeseriesPoint[]
  pointsCounterfactual: FeederTimeseriesPoint[]
  kpisBaseline: FeederKPIs | null
  kpisCounterfactual: FeederKPIs | null
}

/** A real two-state comparison -- the evidence-backed baseline (no controllable flexibility
 *  found) against the counterfactual broad-eligibility scenario -- toggled by a slider-styled
 *  switch. Deliberately a snap-to-either-end toggle rather than a continuously interpolated
 *  slider: there is no simulation data for "40% between scenarios", and inventing an
 *  intermediate curve would fabricate a number that was never modeled. */
export function BeforeAfterComparison({ pointsBaseline, pointsCounterfactual, kpisBaseline, kpisCounterfactual }: BeforeAfterComparisonProps) {
  const [after, setAfter] = useState(false)

  const chart = useMemo(() => {
    const active = after ? pointsCounterfactual : pointsBaseline
    if (active.length < 2) return null
    const demand = active.map((p) => p.net_demand_w)
    const controlled = active.map((p) => p.controlled_load_w)
    const flexible = active.map((p) => p.delivered_flexibility_w)
    const max = Math.max(...demand, ...controlled) * 1.1
    return {
      demandPath: pathFor(demand, max),
      controlledPath: pathFor(controlled, max),
      flexiblePath: pathFor(flexible, max),
    }
  }, [after, pointsBaseline, pointsCounterfactual])

  const kpis = after ? kpisCounterfactual : kpisBaseline

  return (
    <div className="ff-card p-6 md:p-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="ff-mono text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: after ? 'var(--ff-ink-faint)' : 'var(--ff-critical)' }}>
          Without flexibility
        </div>
        <ToggleSwitch checked={after} onChange={setAfter} />
        <div className="ff-mono text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: after ? 'var(--ff-primary)' : 'var(--ff-ink-faint)' }}>
          With flexibility (counterfactual)
        </div>
      </div>

      <div className="mt-6">
        {chart ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={PAD_L} x2={W - PAD_R} y1={PAD_T + (H - PAD_T - PAD_B) * f} y2={PAD_T + (H - PAD_T - PAD_B) * f} stroke="var(--ff-line)" strokeDasharray="2 4" />
            ))}
            <motion.path d={chart.demandPath} fill="none" stroke="var(--ff-line-strong)" strokeWidth={2} strokeDasharray="3 4" animate={{ opacity: 1 }} transition={{ duration: 0.4 }} key={`demand-${after}`} />
            {after && (
              <motion.path
                d={chart.flexiblePath} fill="none" stroke="var(--ff-primary)" strokeOpacity={0.35} strokeWidth={10}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} key="flexible-band"
              />
            )}
            <motion.path
              d={chart.controlledPath} fill="none" strokeWidth={2.75} strokeLinecap="round"
              stroke={after ? 'var(--ff-primary)' : 'var(--ff-critical)'}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: 'easeInOut' }}
              key={`controlled-${after}`}
            />
          </svg>
        ) : (
          <div className="ff-neu-inset flex h-[180px] items-center justify-center text-[13px] text-[var(--ff-ink-faint)]">Loading modeled trace…</div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-5">
          <span className="ff-mono inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ff-ink-faint)]">
            <span className="h-2 w-2 rounded-full" style={{ background: after ? 'var(--ff-primary)' : 'var(--ff-critical)' }} />
            {after ? 'Controlled load' : 'Demand (uncontrolled)'}
          </span>
          {after && (
            <span className="ff-mono inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ff-ink-faint)]">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--ff-primary)', opacity: 0.4 }} />
              Delivered flexibility
            </span>
          )}
          <span className="ff-mono ml-auto text-[10px] text-[var(--ff-ink-faint)]">First 24 modeled hours</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <Stat label="Peak reduction" value={kpis ? formatPct(kpis.peak_reduction_pct) : '—'} accent={after ? 'var(--ff-primary)' : 'var(--ff-ink)'} />
        <Stat label="Delivered flexibility" value={kpis ? formatWh(kpis.delivered_flexibility_wh) : '—'} accent={after ? 'var(--ff-primary)' : 'var(--ff-ink)'} />
        <Stat label="Shortfall hours" value={kpis ? String(kpis.shortfall_hours) : '—'} accent={kpis && kpis.shortfall_hours > 0 ? 'var(--ff-warn)' : 'var(--ff-ink)'} />
        <Stat
          label="Grid stress"
          value={!kpis ? '—' : kpis.delivered_flexibility_wh === 0 ? 'No flexibility deployed' : kpis.shortfall_coverage_pct !== null ? `${formatPct(kpis.shortfall_coverage_pct)} covered` : 'Unmeasured'}
          accent={kpis && kpis.delivered_flexibility_wh === 0 ? 'var(--ff-critical)' : 'var(--ff-primary)'}
          small
        />
      </div>
      <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--ff-ink-faint)]">
        {after
          ? 'Illustrative of mechanism under a hypothetical, expanded controllability assumption — not measured or field-validated.'
          : 'The evidence-backed baseline: no appliance population currently meets all profile, eligibility, and controllability requirements.'}
      </p>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle between without-flexibility and with-flexibility scenario"
      onClick={() => onChange(!checked)}
      className="ff-neu-inset relative h-8 w-16 shrink-0 rounded-full"
    >
      <motion.span
        className="absolute top-1 h-6 w-6 rounded-full shadow"
        style={{ background: checked ? 'var(--ff-primary)' : 'var(--ff-critical)' }}
        animate={{ left: checked ? 'calc(100% - 28px)' : '4px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </button>
  )
}

function Stat({ label, value, accent, small }: { label: string; value: string; accent: string; small?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="ff-mono text-[9.5px] uppercase tracking-wide text-[var(--ff-ink-faint)]">{label}</span>
      <span className={`ff-mono font-bold tabular-nums ${small ? 'text-[13px]' : 'text-[19px]'}`} style={{ color: accent }}>{value}</span>
    </div>
  )
}
