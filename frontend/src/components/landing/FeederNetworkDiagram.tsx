import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Gauge, Home, Pause, Play, Sun } from 'lucide-react'
import type { FeederTimeseriesPoint, TransformerSummary } from '../../types/api'
import { formatPct, formatTimestamp, formatW } from '../../utils/format'

const CW = 640
const CH = 180
const PAD = 10

function areaPath(values: number[], max: number) {
  const n = values.length
  if (n < 2) return { line: '', area: '' }
  const innerW = CW - PAD * 2
  const innerH = CH - PAD * 2
  const pts = values.map((v, i) => {
    const x = PAD + (i / (n - 1)) * innerW
    const y = PAD + innerH - (max > 0 ? (v / max) * innerH : 0)
    return [x, y] as const
  })
  const line = pts.reduce((d, [x, y], i) => d + `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `, '')
  const area = `${line} L${(PAD + innerW).toFixed(1)},${PAD + innerH} L${PAD},${PAD + innerH} Z`
  return { line, area }
}

function utilizationStatus(peakW: number, capacityKva: number): { label: string; color: string } {
  const ratio = capacityKva > 0 ? peakW / 1000 / capacityKva : 0
  if (ratio >= 0.9) return { label: 'High utilization', color: 'var(--ff-critical)' }
  if (ratio >= 0.7) return { label: 'Elevated utilization', color: 'var(--ff-warn)' }
  return { label: 'Normal utilization', color: 'var(--ff-primary)' }
}

export interface FeederNetworkDiagramProps {
  transformers: TransformerSummary[]
  points: FeederTimeseriesPoint[]
  renewableLatestPct: number | null
}

/** The rebuilt grid schematic: a real hierarchical feeder diagram (renewable -> feeder bus ->
 *  11 real transformers -> household clusters), an animated power-flow, a small "how to read
 *  this" legend, and a synced playback panel + 24h balance chart -- all driven from real,
 *  already-fetched API data (transformer list + a real 24-hour timeseries slice). No per-hour
 *  per-transformer breakdown exists in the API, so playback drives the feeder-level readout and
 *  flow-speed only; hovering a transformer still shows that transformer's own real aggregate
 *  figures, never a fabricated hourly value. */
export function FeederNetworkDiagram({ transformers, points, renewableLatestPct }: FeederNetworkDiagramProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (playing && points.length > 1) {
      timer.current = window.setInterval(() => setIndex((i) => (i + 1) % points.length), 700)
    }
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [playing, points.length])

  const current = points[index] ?? null
  const maxDemand = useMemo(() => Math.max(1, ...points.map((p) => p.net_demand_w)), [points])
  const intensity = current ? Math.min(1, current.net_demand_w / maxDemand) : 0.4
  const flowDuration = 1.5 - intensity * 0.9 // 0.6s (high load) .. 1.5s (low load)

  const chart = useMemo(() => {
    if (points.length < 2) return null
    const demand = points.map((p) => p.net_demand_w)
    const renew = points.map((p) => p.renewable_w)
    const flex = points.map((p) => p.delivered_flexibility_w)
    const max = Math.max(...demand, ...renew) * 1.08
    return { demand: areaPath(demand, max), renew: areaPath(renew, max), flex: areaPath(flex, max) }
  }, [points])

  const householdsCap = 14

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      {/* ---------- Diagram ---------- */}
      <div className="ff-card relative overflow-hidden p-6">
        <div className="ff-contours" />
        <div className="relative flex flex-col items-center">
          {/* Renewable node */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'rgba(143,191,122,0.18)', color: 'var(--ff-energy)' }}>
              <Sun size={20} strokeWidth={1.8} />
            </span>
            <span className="ff-mono text-[9px] uppercase tracking-wide text-[var(--ff-ink-faint)]">Renewable</span>
            <span className="ff-mono text-[11px] font-bold" style={{ color: 'var(--ff-primary)' }}>
              {renewableLatestPct !== null ? formatPct(renewableLatestPct * 100) : '—'}
            </span>
          </div>

          <div className="ff-flow-v h-8 w-[3px] rounded-full" style={{ animationDuration: `${flowDuration}s` }} />

          {/* Feeder bus */}
          <div className="ff-neu-inset flex items-center gap-2 rounded-full px-4 py-1.5">
            <span className="ff-mono text-[10px] font-bold uppercase tracking-wide text-[var(--ff-ink)]">Feeder 001</span>
            <span className="ff-mono text-[10px] text-[var(--ff-ink-faint)]">{current ? formatW(current.net_demand_w) : '—'}</span>
          </div>

          <div className="ff-flow-v h-6 w-[3px] rounded-full" style={{ animationDuration: `${flowDuration}s` }} />

          {/* Horizontal bus line + drops to transformers */}
          <div className="relative mt-0 w-full">
            <div className="ff-flow-h mx-auto h-[3px] max-w-[92%] rounded-full" style={{ animationDuration: `${flowDuration}s` }} />
          </div>

          <div className="mt-4 flex w-full flex-wrap items-start justify-center gap-4">
            {transformers.map((t) => {
              const isHovered = hovered === t.transformer_id
              const status = utilizationStatus(t.peak_demand_w, t.capacity_kva)
              const dotCount = Math.min(t.n_households, householdsCap)
              return (
                <div
                  key={t.transformer_id}
                  className="relative flex flex-col items-center gap-2"
                  onMouseEnter={() => setHovered(t.transformer_id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="ff-flow-v h-4 w-[2px] rounded-full" style={{ animationDuration: `${flowDuration}s` }} />
                  <motion.div
                    className="ff-card flex w-[118px] flex-col items-center gap-1.5 p-3"
                    animate={{ y: isHovered ? -3 : 0, borderColor: isHovered ? 'var(--ff-primary)' : undefined }}
                    style={{ zIndex: isHovered ? 3 : 1 }}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: isHovered ? 'var(--ff-primary)' : 'var(--ff-secondary)' }}>
                      <Gauge size={13} strokeWidth={2} />
                    </span>
                    <span className="ff-mono text-[9.5px] font-semibold text-[var(--ff-ink)]">{t.transformer_id}</span>
                    <div className="flex flex-wrap justify-center gap-[3px]" style={{ maxWidth: 80 }}>
                      {Array.from({ length: dotCount }).map((_, i) => (
                        <span key={i} className="h-[5px] w-[5px] rounded-full" style={{ background: isHovered ? 'var(--ff-primary)' : 'var(--ff-line-strong)' }} />
                      ))}
                    </div>
                    <span className="ff-mono text-[9px] text-[var(--ff-ink-faint)]">{t.n_households} HH</span>
                  </motion.div>

                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                      className="ff-glass absolute top-full z-10 mt-2 w-[184px] p-3 text-left"
                    >
                      <p className="ff-mono text-[10px] font-bold text-[var(--ff-ink)]">{t.transformer_id}</p>
                      <dl className="mt-1.5 flex flex-col gap-1 text-[11px]">
                        <Row label="Households" value={String(t.n_households)} />
                        <Row label="Modeled peak" value={formatW(t.peak_demand_w)} />
                        <Row label="Capacity" value={`${t.capacity_kva} kVA`} />
                      </dl>
                      <p className="ff-mono mt-1.5 text-[9.5px] font-semibold" style={{ color: status.color }}>{status.label} (derived)</p>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---------- Legend + simulation panel ---------- */}
      <div className="flex flex-col gap-4">
        <div className="ff-surface p-4">
          <span className="ff-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ff-ink-faint)]">How to read this feeder</span>
          <ol className="mt-2.5 flex flex-col gap-2 text-[11.5px] leading-snug text-[var(--ff-ink-dim)]">
            <li><b className="text-[var(--ff-ink)]">① Feeder</b> — the shared electricity path all transformers connect to.</li>
            <li><b className="text-[var(--ff-ink)]">② Transformer</b> — steps voltage down for a cluster of local households.</li>
            <li><b className="text-[var(--ff-ink)]">③ Household cluster</b> — dots represent homes connected to that transformer.</li>
            <li><b className="text-[var(--ff-ink)]">④ Flow</b> — the animated line shows the modeled network path, not live telemetry.</li>
          </ol>
        </div>

        <div className="ff-glass p-4">
          <div className="flex items-center justify-between">
            <span className="ff-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ff-ink-faint)]">Feeder simulation</span>
            <span className="ff-mono flex items-center gap-1.5 text-[9.5px] text-[var(--ff-ink-faint)]">
              <span className="h-1.5 w-1.5 rounded-full ff-pulse" style={{ background: playing ? 'var(--ff-primary)' : 'var(--ff-ink-faint)' }} />
              Simulation playback
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniStat icon={Home} label="Load" value={current ? formatW(current.net_demand_w) : '—'} />
            <MiniStat icon={Sun} label="Renewable" value={renewableLatestPct !== null ? formatPct(renewableLatestPct * 100) : '—'} />
            <MiniStat icon={Gauge} label="Flexibility" value={current ? formatW(current.delivered_flexibility_w) : '—'} />
            <MiniStat icon={Gauge} label="Stress" value={current ? current.event_state : '—'} />
          </div>

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="ff-neu-btn ff-mono mt-3 flex w-full items-center justify-center gap-2 py-2 text-[12px] font-semibold"
            style={{ color: 'var(--ff-primary)' }}
          >
            {playing ? <Pause size={14} strokeWidth={2.2} /> : <Play size={14} strokeWidth={2.2} />}
            {playing ? 'Pause simulation' : 'Play simulation'}
          </button>
          <p className="ff-mono mt-2 text-center text-[10px] text-[var(--ff-ink-faint)]">
            {current ? formatTimestamp(current.timestamp) : '—'} · hour {index + 1} / {points.length || 1}
          </p>
        </div>
      </div>

      {/* ---------- 24h feeder balance chart with synced cursor ---------- */}
      {chart && (
        <div className="ff-card p-5 lg:col-span-2">
          <span className="ff-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ff-ink-faint)]">
            24-hour feeder balance — drag or click to scrub the diagram above
          </span>
          <svg
            viewBox={`0 0 ${CW} ${CH}`} className="mt-2 h-auto w-full cursor-pointer touch-none select-none"
            onPointerDown={(e) => scrub(e, points.length, setIndex)}
            onPointerMove={(e) => { if (e.buttons === 1) scrub(e, points.length, setIndex) }}
          >
            <path d={chart.demand.area} fill="var(--ff-critical)" opacity={0.08} />
            <path d={chart.renew.area} fill="var(--ff-energy)" opacity={0.12} />
            <path d={chart.demand.line} fill="none" stroke="var(--ff-critical)" strokeWidth={2} />
            <path d={chart.renew.line} fill="none" stroke="var(--ff-energy)" strokeWidth={2} />
            <path d={chart.flex.line} fill="none" stroke="var(--ff-primary)" strokeWidth={1.75} strokeDasharray="3 3" />
            {points.length > 1 && (
              <line
                x1={PAD + (index / (points.length - 1)) * (CW - PAD * 2)} x2={PAD + (index / (points.length - 1)) * (CW - PAD * 2)}
                y1={PAD} y2={CH - PAD} stroke="var(--ff-ink)" strokeWidth={1.5} strokeDasharray="2 3"
              />
            )}
          </svg>
          <div className="mt-2 flex flex-wrap items-center gap-5">
            <ChartLegend color="var(--ff-critical)" label="Demand" />
            <ChartLegend color="var(--ff-energy)" label="Renewable" />
            <ChartLegend color="var(--ff-primary)" label="Flexibility" dashed />
          </div>
        </div>
      )}
    </div>
  )
}

function scrub(e: React.PointerEvent<SVGSVGElement>, n: number, setIndex: (i: number) => void) {
  if (n < 2) return
  const rect = e.currentTarget.getBoundingClientRect()
  const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  setIndex(Math.round(frac * (n - 1)))
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--ff-ink-faint)]">{label}</dt>
      <dd className="ff-mono font-medium text-[var(--ff-ink)]">{value}</dd>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <div className="ff-neu-inset flex flex-col gap-1 p-2.5">
      <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-[var(--ff-ink-faint)]">
        <Icon size={11} strokeWidth={1.8} /> {label}
      </span>
      <span className="ff-mono text-[12.5px] font-bold text-[var(--ff-ink)]">{value}</span>
    </div>
  )
}

function ChartLegend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="ff-mono inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ff-ink-faint)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color, opacity: dashed ? 0.6 : 1 }} />
      {label}
    </span>
  )
}
