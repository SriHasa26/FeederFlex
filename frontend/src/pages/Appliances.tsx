import { AlertTriangle } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { PageHeader } from '../components/PageHeader'

export function Appliances() {
  const state = useApi(() => api.appliances(), [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Appliance population" title="Appliances" subtitle="Modeled appliance population across all 100 synthetic households." />

      <AsyncBoundary state={state} label="appliance population">
        {(data) => (
          <>
            <div className="ff-surface flex items-start gap-3 p-4 text-sm" style={{ borderColor: 'rgba(216,155,69,0.4)', background: 'rgba(216,155,69,0.08)', color: '#8A6420' }}>
              <AlertTriangle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
              <span>
                Only {data.n_profiled_types} of {data.n_total_types} owned appliance types currently
                have real load profiles. The 4 profiled types below do not represent the complete
                appliance population — 9 additional types are known to be owned but have no
                measured load curve.
              </span>
            </div>
            <div className="ff-surface overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-[10.5px] uppercase tracking-wide text-[var(--ff-ink-faint)]" style={{ borderColor: 'var(--ff-line)' }}>
                  <tr>
                    <th className="px-4 py-3">Appliance type</th>
                    <th className="px-4 py-3">Instances</th>
                    <th className="px-4 py-3">Real load profile</th>
                    <th className="px-4 py-3">Eligible by default</th>
                    <th className="px-4 py-3">Criticality</th>
                  </tr>
                </thead>
                <tbody>
                  {data.types.map((t) => (
                    <tr key={t.appliance_type} className="border-b" style={{ borderColor: 'var(--ff-line)' }}>
                      <td className="px-4 py-3 font-medium text-[var(--ff-ink)]">{t.appliance_type}</td>
                      <td className="ff-mono px-4 py-3">{t.n_instances}</td>
                      <td className="px-4 py-3">
                        {t.has_real_load_profile ? (
                          <span className="ff-mono rounded-md border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: 'rgba(31,92,69,0.35)', background: 'rgba(143,191,122,0.14)', color: 'var(--ff-primary)' }}>Profiled</span>
                        ) : (
                          <span className="ff-mono rounded-md border px-2 py-0.5 text-[11px]" style={{ borderColor: 'var(--ff-line-strong)', background: 'var(--ff-surface-sunken)', color: 'var(--ff-ink-faint)' }}>No profile</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{t.eligible_for_control_default ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 text-[var(--ff-ink-dim)]">{t.criticality ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}
