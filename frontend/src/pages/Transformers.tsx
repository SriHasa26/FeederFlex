import { useState } from 'react'
import { Gauge } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { useScenario } from '../hooks/useScenario'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ScenarioSelector } from '../components/ScenarioSelector'
import { PageHeader } from '../components/PageHeader'
import { formatW, formatWh } from '../utils/format'
import type { TransformerSummary } from '../types/api'

export function Transformers() {
  const { scenario } = useScenario()
  const list = useApi(() => api.transformers(), [])
  const [selected, setSelected] = useState<string | null>(null)
  const detail = useApi(
    () => (selected ? api.transformer(selected, scenario) : Promise.reject(new Error('no selection'))),
    [selected, scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Grid infrastructure"
        title="Transformers"
        subtitle="Synthetic transformer grouping. 25 kVA is a methodological plausibility anchor, not a validated field rating."
      />

      <ScenarioSelector />

      <AsyncBoundary state={list} label="transformers">
        {(transformers) => (
          <div className="ff-surface overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-[10.5px] uppercase tracking-wide text-[var(--ff-ink-faint)]" style={{ borderColor: 'var(--ff-line)' }}>
                <tr>
                  <th className="px-4 py-3">Transformer</th>
                  <th className="px-4 py-3">Archetypes</th>
                  <th className="px-4 py-3">Households</th>
                  <th className="px-4 py-3">Capacity (kVA)</th>
                  <th className="px-4 py-3">Peak demand</th>
                  <th className="px-4 py-3">Average demand</th>
                </tr>
              </thead>
              <tbody>
                {transformers.map((t: TransformerSummary) => (
                  <tr
                    key={t.transformer_id}
                    onClick={() => setSelected(t.transformer_id)}
                    className="cursor-pointer border-b transition hover:bg-[var(--ff-surface-alt)]"
                    style={{ borderColor: 'var(--ff-line)', background: selected === t.transformer_id ? 'rgba(31,92,69,0.06)' : undefined }}
                  >
                    <td className="ff-mono flex items-center gap-2 px-4 py-3 font-semibold text-[var(--ff-ink)]">
                      <Gauge size={13} strokeWidth={2} style={{ color: 'var(--ff-secondary)' }} />
                      {t.transformer_id}
                    </td>
                    <td className="px-4 py-3 text-[var(--ff-ink-dim)]">{t.archetype_ids.join(', ')}</td>
                    <td className="px-4 py-3">{t.n_households}</td>
                    <td className="px-4 py-3">{t.capacity_kva}</td>
                    <td className="ff-mono px-4 py-3">{formatW(t.peak_demand_w)}</td>
                    <td className="ff-mono px-4 py-3">{formatW(t.average_demand_w)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncBoundary>

      {selected && (
        <div className="ff-card p-5">
          <h2 className="ff-display mb-3 text-[15px] font-bold text-[var(--ff-ink)]">{selected} — detail</h2>
          <AsyncBoundary state={detail} label="transformer detail">
            {(d) => (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Stat label="Capacity" value={`${d.capacity_kva} kVA`} />
                  <Stat label="Households" value={String(d.n_households)} />
                  <Stat label="Curtailed energy (scenario)" value={formatWh(d.curtailed_energy_wh)} />
                  <Stat label="Interventions (scenario)" value={String(d.n_interventions)} />
                </div>
                <p className="text-xs text-[var(--ff-ink-faint)]">{d.capacity_provenance}</p>
                <div>
                  <p className="ff-mono mb-1.5 text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">Connected households</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.household_ids.map((h: string) => (
                      <span key={h} className="ff-mono rounded-md border px-2 py-0.5 text-[11px] text-[var(--ff-ink-dim)]" style={{ borderColor: 'var(--ff-line)' }}>{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AsyncBoundary>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="ff-mono text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">{label}</span>
      <span className="ff-mono text-lg font-semibold text-[var(--ff-ink)]">{value}</span>
    </div>
  )
}
