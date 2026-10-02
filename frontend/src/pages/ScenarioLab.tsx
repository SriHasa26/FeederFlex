import { useEffect, useState } from 'react'
import { useScenario } from '../hooks/useScenario'
import { useApi } from '../hooks/useApi'
import { api, scenarioKey } from '../services/api'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ScenarioSelector } from '../components/ScenarioSelector'
import { KpiCard } from '../components/KpiCard'
import { formatPct, formatW, formatWh } from '../utils/format'
import type { ScenarioResult } from '../types/api'

const PARTICIPATION_OPTIONS = [30, 50, 70, 90]

export function ScenarioLab() {
  const { scenario, isEvidenceBacked } = useScenario()
  const current = useApi(() => api.scenarioResult(scenarioKey(scenario)), [scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="ff-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--ff-secondary)' }}>Simulation control</span>
        <h1 className="ff-display mt-1 text-[24px] font-extrabold text-[var(--ff-ink)]">Scenario Lab</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] text-[var(--ff-ink-dim)]">
          Select a capacity scenario, eligibility mode, and participation rate to inspect the
          validated Phase 8/9 result.{' '}
          {!isEvidenceBacked && (
            <span className="ff-mono font-medium" style={{ color: 'var(--ff-counterfactual)' }}>These results are illustrative, not real-world impact.</span>
          )}
        </p>
      </div>

      <ScenarioSelector />

      <AsyncBoundary state={current} label="scenario result">
        {(r: ScenarioResult) => (
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            <KpiCard label="Peak reduction" value={formatW(r.peak_reduction_w)} accent={r.peak_reduction_w > 0 ? 'teal' : 'neutral'} />
            <KpiCard label="Evening reduction" value={formatW(r.evening_reduction_w)} />
            <KpiCard label="Curtailed energy" value={formatWh(r.curtailed_energy_wh)} accent="teal" />
            <KpiCard label="Delivered flexibility" value={formatWh(r.delivered_flexibility_wh)} />
            <KpiCard label="Unmet flexibility" value={formatWh(r.unmet_flexibility_wh)} accent={r.unmet_flexibility_wh > 0 ? 'amber' : 'neutral'} />
            <KpiCard label="Interventions" value={String(r.interventions)} />
            <KpiCard label="Flexibility utilization" value={r.flexibility_utilization_pct === null ? 'N/A' : formatPct(r.flexibility_utilization_pct)} />
            <KpiCard label="Insufficient-flexibility hours" value={String(r.insufficient_flexibility_hours)} />
          </div>
        )}
      </AsyncBoundary>

      <ParticipationComparison capacityScenario={scenario.capacity_scenario} eligibilityScenario={scenario.eligibility_scenario} />
    </div>
  )
}

function ParticipationComparison({ capacityScenario, eligibilityScenario }: { capacityScenario: string; eligibilityScenario: string }) {
  const [rows, setRows] = useState<ScenarioResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setRows(null)
    setError(null)
    Promise.all(
      PARTICIPATION_OPTIONS.map((p) =>
        api.scenarioResult(scenarioKey({ capacity_scenario: capacityScenario, eligibility_scenario: eligibilityScenario, participation_pct: p })),
      ),
    )
      .then((results) => !cancelled && setRows(results))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
    return () => {
      cancelled = true
    }
  }, [capacityScenario, eligibilityScenario])

  return (
    <div className="ff-card p-4">
      <h2 className="ff-mono mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ff-ink-faint)]">
        Participation comparison — {eligibilityScenario} / {capacityScenario}
      </h2>
      {error && <p className="text-sm" style={{ color: 'var(--ff-critical)' }}>{error}</p>}
      {!rows && !error && <p className="text-sm text-[var(--ff-ink-dim)]">Loading…</p>}
      {rows && (
        <table className="w-full text-left text-sm">
          <thead className="border-b text-[10.5px] uppercase tracking-wide text-[var(--ff-ink-faint)]" style={{ borderColor: 'var(--ff-line)' }}>
            <tr>
              <th className="py-2 pr-4">Participation</th>
              <th className="py-2 pr-4">Peak reduction</th>
              <th className="py-2 pr-4">Curtailed energy</th>
              <th className="py-2 pr-4">Unmet flexibility</th>
              <th className="py-2 pr-4">Interventions</th>
              <th className="py-2 pr-4">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.scenario.participation_pct} className="border-b" style={{ borderColor: 'var(--ff-line)' }}>
                <td className="ff-mono py-2 pr-4 font-semibold text-[var(--ff-ink)]">{r.scenario.participation_pct}%</td>
                <td className="ff-mono py-2 pr-4">{formatW(r.peak_reduction_w)}</td>
                <td className="ff-mono py-2 pr-4">{formatWh(r.curtailed_energy_wh)}</td>
                <td className="ff-mono py-2 pr-4">{formatWh(r.unmet_flexibility_wh)}</td>
                <td className="py-2 pr-4">{r.interventions}</td>
                <td className="py-2 pr-4">{r.flexibility_utilization_pct === null ? 'N/A' : formatPct(r.flexibility_utilization_pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
