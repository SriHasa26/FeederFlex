import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity } from 'lucide-react'
import { useScenario } from '../hooks/useScenario'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ScenarioSelector } from '../components/ScenarioSelector'
import { KpiCard } from '../components/KpiCard'
import { EventStateBadge } from '../components/Badges'
import { PlaybackControl } from '../components/PlaybackControl'
import { GridNetworkViz } from '../components/GridNetworkViz'
import { LoadChart } from '../charts/LoadChart'
import { RenewableChart } from '../charts/RenewableChart'
import { FlexibilityChart } from '../charts/FlexibilityChart'
import { TransformerContributionChart } from '../charts/TransformerContributionChart'
import { formatPct, formatTimestamp, formatW, formatWh } from '../utils/format'
import type { FeederTimeseriesPoint } from '../types/api'

export function Dashboard() {
  const { scenario } = useScenario()
  const timeseries = useApi(() => api.feederTimeseries(scenario, { limit: 2000 }), [scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct])
  const kpis = useApi(() => api.feederKpis(scenario), [scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct])
  const renewable = useApi(() => api.renewable(500), [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="ff-mono inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--ff-secondary)' }}>
            <Activity size={12} strokeWidth={2.2} /> System Status · Operational
          </span>
          <h1 className="ff-display mt-1 text-[24px] font-extrabold text-[var(--ff-ink)]">Simulation Dashboard</h1>
          <p className="text-[13px] text-[var(--ff-ink-dim)]">
            Deterministic historical simulation playback — no live or randomly generated data.
          </p>
        </div>
      </div>

      <ScenarioSelector />

      <AsyncBoundary state={kpis} label="feeder KPIs">
        {(k) => (
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Modeled peak demand" value={formatW(k.modeled_peak_w)} />
            <KpiCard label="Controlled peak" value={formatW(k.controlled_peak_w)} accent="teal" />
            <KpiCard label="Peak reduction" value={formatPct(k.peak_reduction_pct)} sub={formatW(k.peak_reduction_w)} accent={k.peak_reduction_w > 0 ? 'teal' : 'neutral'} />
            <KpiCard label="Shortfall hours" value={String(k.shortfall_hours)} accent={k.shortfall_hours > 0 ? 'amber' : 'neutral'} />
            <KpiCard label="Delivered flexibility" value={formatWh(k.delivered_flexibility_wh)} accent="teal" />
            <KpiCard label="Shortfall coverage" value={k.shortfall_coverage_pct === null ? 'N/A' : formatPct(k.shortfall_coverage_pct)} />
          </div>
        )}
      </AsyncBoundary>

      <AsyncBoundary state={timeseries} label="feeder timeseries">
        {(ts) => <PlaybackDashboard points={ts.points} />}
      </AsyncBoundary>

      <div className="ff-card p-4">
        <SectionLabel>Renewable availability (normalized, all-scenario context)</SectionLabel>
        <AsyncBoundary state={renewable} label="renewable availability">
          {(r) => <RenewableChart points={r.points} />}
        </AsyncBoundary>
      </div>

      <div className="ff-card p-4">
        <SectionLabel>Transformer-level contribution (cumulative curtailed energy)</SectionLabel>
        <TransformerContributionChart scenario={scenario} />
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="ff-mono mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ff-ink-faint)]">{children}</h2>
}

function PlaybackDashboard({ points }: { points: FeederTimeseriesPoint[] }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setIndex(0)
  }, [points])

  useEffect(() => {
    if (playing) {
      timer.current = window.setInterval(() => {
        setIndex((i) => (i + 1 >= points.length ? 0 : i + 1))
      }, 250)
    }
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [playing, points.length])

  const current = points[index]
  const window20 = useMemo(() => points.slice(Math.max(0, index - 200), index + 1), [points, index])

  if (!current) return null

  return (
    <div className="flex flex-col gap-4">
      <PlaybackControl
        index={index}
        max={points.length - 1}
        playing={playing}
        timestampLabel={formatTimestamp(current.timestamp)}
        onPrev={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(points.length - 1, i + 1))}
        onTogglePlay={() => setPlaying((p) => !p)}
        onScrub={(i) => { setPlaying(false); setIndex(i) }}
      />

      {/* Asymmetric operations layout: wide load/stress column + narrow live network column */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            <KpiCard label="Net demand" value={formatW(current.net_demand_w)} />
            <KpiCard label="Assumed scenario capacity" value={formatW(current.permitted_import_w)} sub="permitted import ceiling" />
            <KpiCard label="Renewable offset" value={formatW(current.renewable_w)} />
            <KpiCard label="Controlled load" value={formatW(current.controlled_load_w)} accent="teal" />
          </div>

          <div className="ff-card p-4">
            <SectionLabel>Baseline vs controlled load (last 200 modeled hours to current)</SectionLabel>
            <LoadChart points={window20} />
          </div>

          <GridStressPanel point={current} />
        </div>

        <div className="flex flex-col gap-4">
          <GridNetworkViz
            // The per-hour timeseries point carries renewable_w (an absolute offset), not the
            // normalized [0,1] availability fraction the /api/renewable series provides -- shown
            // as "—" rather than a mislabeled derived percentage (no fabricated numbers).
            renewableAvailability={null}
            feederLoadW={current.net_demand_w}
            flexibleW={current.delivered_flexibility_w}
            eventState={current.event_state}
            compact
          />
          <FlexibilityPanel point={current} />
        </div>
      </div>

      <div className="ff-card p-4">
        <SectionLabel>Available vs delivered flexibility (last 200 modeled hours to current)</SectionLabel>
        <FlexibilityChart points={window20} />
      </div>
    </div>
  )
}

function GridStressPanel({ point }: { point: FeederTimeseriesPoint }) {
  return (
    <div className="ff-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Grid stress</SectionLabel>
        <EventStateBadge state={point.event_state} size="lg" />
      </div>
      <div className="grid grid-cols-2 gap-3.5 text-sm md:grid-cols-5">
        <Field label="Demand" value={formatW(point.net_demand_w)} />
        <Field label="Renewable availability" value={formatW(point.renewable_w)} />
        <Field label="Assumed scenario capacity" value={formatW(point.permitted_import_w)} />
        <Field label="Requested flexibility" value={formatW(point.required_flexibility_w)} />
        <Field label="Unmet flexibility" value={formatW(point.unmet_flexibility_w)} accent={point.unmet_flexibility_w > 0 ? 'red' : undefined} />
      </div>
    </div>
  )
}

function FlexibilityPanel({ point }: { point: FeederTimeseriesPoint }) {
  const zero = point.available_flexibility_w === 0
  return (
    <div className="ff-card p-4">
      <SectionLabel>Flexibility</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 text-sm">
        <Field label="Available flexibility" value={formatW(point.available_flexibility_w)} />
        <Field label="Delivered flexibility" value={formatW(point.delivered_flexibility_w)} accent="teal" />
        <Field label="Active interventions" value={String(point.n_interventions_active)} />
        <Field label="Shortfall" value={formatW(point.shortfall_w)} />
      </div>
      {zero && (
        <p className="ff-neu-inset mt-3 p-3 text-xs text-[var(--ff-ink-dim)]">
          0 W currently controllable under evidence-backed eligibility. The validated baseline
          contains no appliance population that meets all current profile, eligibility, and
          controllability requirements. This is a research finding, not an error.
        </p>
      )}
    </div>
  )
}

function Field({ label, value, accent }: { label: string; value: string; accent?: 'red' | 'teal' }) {
  const color = accent === 'red' ? 'var(--ff-critical)' : accent === 'teal' ? 'var(--ff-primary)' : 'var(--ff-ink)'
  return (
    <div className="flex flex-col gap-0.5">
      <span className="ff-mono text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">{label}</span>
      <span className="ff-mono font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}
