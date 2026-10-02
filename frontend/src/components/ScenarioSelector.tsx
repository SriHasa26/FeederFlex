import { useScenario } from '../hooks/useScenario'
import { EvidenceBadge } from './Badges'
import { capacityLabel, scenarioLabel } from '../utils/format'

const ELIGIBILITY_OPTIONS = ['baseline', 'counterfactual_ac_enabled', 'counterfactual_broad']
const CAPACITY_OPTIONS = ['assumed_stress_test', 'assumed_nameplate_capacity']
const PARTICIPATION_OPTIONS = [30, 50, 70, 90]

// Neumorphic inset styling applied directly to the <select> (not a wrapper) so each <label>
// remains a direct preceding-sibling of its <select> -- relied on by the accessibility E2E test.
const selectCls =
  'ff-neu-inset ff-mono w-full appearance-none border-0 bg-[var(--ff-surface-sunken)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--ff-ink)] outline-none cursor-pointer'

export function ScenarioSelector({ compact = false }: { compact?: boolean }) {
  const { scenario, setScenario, isEvidenceBacked } = useScenario()

  return (
    <div className={`ff-surface flex flex-wrap items-center gap-3 ${compact ? 'p-2.5' : 'p-3.5'}`}>
      <span className="ff-mono hidden items-center gap-1.5 pl-1 text-[10px] uppercase tracking-[0.1em] text-[var(--ff-ink-faint)] sm:flex">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--ff-secondary)' }} />
        Control panel
      </span>

      <div className="flex flex-col gap-1">
        <label htmlFor="eligibility-select" className="ff-mono px-0.5 text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">
          Eligibility mode
        </label>
        <select
          id="eligibility-select"
          value={scenario.eligibility_scenario}
          onChange={(e) => setScenario({ eligibility_scenario: e.target.value })}
          className={selectCls}
        >
          {ELIGIBILITY_OPTIONS.map((e) => (
            <option key={e} value={e}>{scenarioLabel(e)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="capacity-select" className="ff-mono px-0.5 text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">
          Capacity scenario
        </label>
        <select
          id="capacity-select"
          value={scenario.capacity_scenario}
          onChange={(e) => setScenario({ capacity_scenario: e.target.value })}
          className={selectCls}
        >
          {CAPACITY_OPTIONS.map((c) => (
            <option key={c} value={c}>{capacityLabel(c)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="participation-select" className="ff-mono px-0.5 text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">
          Participation
        </label>
        <select
          id="participation-select"
          value={scenario.participation_pct}
          onChange={(e) => setScenario({ participation_pct: Number(e.target.value) })}
          className={selectCls}
        >
          {PARTICIPATION_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}%</option>
          ))}
        </select>
      </div>

      <div className="ml-auto">
        <EvidenceBadge evidenceClass={isEvidenceBacked ? 'A' : 'B'} />
      </div>
    </div>
  )
}
