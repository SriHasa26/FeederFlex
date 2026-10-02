import { useState } from 'react'
import { Search } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { useScenario } from '../hooks/useScenario'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ScenarioSelector } from '../components/ScenarioSelector'
import { PageHeader } from '../components/PageHeader'
import { formatWh } from '../utils/format'

export function Households() {
  const { scenario } = useScenario()
  const list = useApi(() => api.households(), [])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const detail = useApi(
    () => (selected ? api.household(selected, scenario) : Promise.reject(new Error('no selection'))),
    [selected, scenario.capacity_scenario, scenario.eligibility_scenario, scenario.participation_pct],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Population"
        title="Households"
        subtitle="Synthetic households — no private or personal information is represented here."
      />

      <ScenarioSelector />

      <div className="ff-neu-inset flex max-w-md items-center gap-2 px-3 py-2">
        <Search size={14} strokeWidth={2} style={{ color: 'var(--ff-ink-faint)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by household ID, archetype, or transformer…"
          className="w-full bg-transparent text-sm text-[var(--ff-ink)] outline-none placeholder:text-[var(--ff-ink-faint)]"
        />
      </div>

      <AsyncBoundary state={list} label="households">
        {(households) => {
          // Plain filter, not useMemo -- this callback runs inside AsyncBoundary's render, not
          // as its own component, so it must not call hooks (Rules of Hooks). 100 rows is cheap
          // enough to filter on every render without memoization.
          const filtered = households.filter((h) =>
            `${h.household_id} ${h.archetype_name} ${h.transformer_id}`.toLowerCase().includes(search.toLowerCase()),
          )
          return (
            <div className="ff-surface max-h-[420px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b text-[10.5px] uppercase tracking-wide text-[var(--ff-ink-faint)]" style={{ borderColor: 'var(--ff-line)', background: 'var(--ff-surface)' }}>
                  <tr>
                    <th className="px-4 py-3">Household</th>
                    <th className="px-4 py-3">Archetype</th>
                    <th className="px-4 py-3">Transformer</th>
                    <th className="px-4 py-3">Appliance instances</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h) => (
                    <tr
                      key={h.household_id}
                      onClick={() => setSelected(h.household_id)}
                      className="cursor-pointer border-b transition hover:bg-[var(--ff-surface-alt)]"
                      style={{ borderColor: 'var(--ff-line)', background: selected === h.household_id ? 'rgba(31,92,69,0.06)' : undefined }}
                    >
                      <td className="ff-mono px-4 py-3 font-semibold text-[var(--ff-ink)]">{h.household_id}</td>
                      <td className="px-4 py-3 text-[var(--ff-ink-dim)]">{h.archetype_name}</td>
                      <td className="px-4 py-3 text-[var(--ff-ink-dim)]">{h.transformer_id}</td>
                      <td className="px-4 py-3">{h.n_appliance_instances}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      </AsyncBoundary>

      {selected && (
        <div className="ff-card p-5">
          <h2 className="ff-display mb-3 text-[15px] font-bold text-[var(--ff-ink)]">{selected} — detail</h2>
          <AsyncBoundary state={detail} label="household detail">
            {(d) => (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Stat label="Archetype" value={d.archetype_name} />
                  <Stat label="Transformer" value={d.transformer_id} />
                  <Stat
                    label="Participating (this scenario)"
                    value={d.participating === null ? 'N/A' : d.participating ? 'Yes' : 'No'}
                  />
                  <Stat label="Curtailed energy (scenario)" value={formatWh(d.total_curtailed_energy_wh)} />
                </div>
                <div>
                  <p className="ff-mono mb-2 text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">Appliance instances</p>
                  <table className="w-full text-left text-xs">
                    <thead className="text-[var(--ff-ink-faint)]">
                      <tr>
                        <th className="py-1 pr-4">Type</th>
                        <th className="py-1 pr-4">Rated power</th>
                        <th className="py-1 pr-4">Criticality</th>
                        <th className="py-1 pr-4">Eligible by default</th>
                        <th className="py-1 pr-4">Provenance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.appliances.map((a) => (
                        <tr key={a.appliance_id} className="border-t" style={{ borderColor: 'var(--ff-line)' }}>
                          <td className="py-1.5 pr-4 text-[var(--ff-ink)]">{a.appliance_type}</td>
                          <td className="ff-mono py-1.5 pr-4">{a.rated_power_w ?? '—'}</td>
                          <td className="py-1.5 pr-4">{a.criticality ?? '—'}</td>
                          <td className="py-1.5 pr-4">{a.eligible_for_control_default ? 'Yes' : 'No'}</td>
                          <td className="py-1.5 pr-4">{a.provenance_class}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
