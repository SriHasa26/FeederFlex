import { PageHeader } from '../components/PageHeader'

const PIPELINE = [
  ['Real data', 'iAWE appliance metering, Indian household consumption surveys, Open-Meteo weather.'],
  ['Household modeling', 'Synthetic households built from real ownership/consumption distributions (Phase 4B).'],
  ['Synthetic feeder', '100 households aggregated onto 11 transformers, anchored to a real CEA capacity range (Phase 4C).'],
  ['Baseline simulation', 'Hourly feeder-level load aggregation with no control applied (Phase 5).'],
  ['Load + renewable forecast', 'Persistence/linear/XGBoost load forecasts; normalized PV availability from real GHI (Phase 6).'],
  ['Flexibility estimation', 'Appliance-level eligibility, protection, and available-now flexibility under an evidence-backed taxonomy (Phase 7).'],
  ['DR controller', 'Deterministic, constrained dispatch: ranking, minimum-intervention selection, hard duration limits, staggered restoration (Phase 8).'],
  ['Evaluation', 'Class A/B separation, sensitivity, fairness, evidence classification, claim matrix (Phase 9).'],
]

const PROVENANCE = [
  ['REAL', 'Directly from a real dataset (e.g. iAWE meter readings, Open-Meteo weather), unmodified.'],
  ['DERIVED', 'Computed from REAL data via a documented, deterministic transformation (e.g. hourly aggregation).'],
  ['SYNTHETIC', 'Generated to fill a structural gap (e.g. household appliance ownership realization) using a documented method, not measured.'],
  ['METHODOLOGICAL_ASSUMPTION / ASSUMED', 'A value with no real-data basis, chosen for demonstration and always explicitly labeled (e.g. stress-test capacity, cooldown duration).'],
]

export function Methodology() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Research pipeline" title="Methodology" subtitle="The complete FeederFlex research pipeline, Phases 4A through 9." />

      <div className="relative flex flex-col gap-2">
        <div className="pointer-events-none absolute bottom-4 left-[19px] top-4 hidden w-px md:block" style={{ background: 'var(--ff-line-strong)' }} />
        {PIPELINE.map(([title, body], i) => (
          <div key={title} className="ff-card relative flex items-start gap-4 p-4">
            <span
              className="ff-mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
              style={{ background: 'rgba(31,92,69,0.1)', color: 'var(--ff-primary)' }}
            >
              {i + 1}
            </span>
            <div>
              <h3 className="ff-display text-[14.5px] font-bold text-[var(--ff-ink)]">{title}</h3>
              <p className="mt-1 text-[13px] text-[var(--ff-ink-dim)]">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="ff-display text-[19px] font-bold text-[var(--ff-ink)]">Provenance classification</h2>
        <p className="mt-1 text-[13.5px] text-[var(--ff-ink-dim)]">
          Every value produced anywhere in this pipeline carries one of four labels.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PROVENANCE.map(([label, body]) => (
            <div key={label} className="ff-card p-4">
              <span className="ff-mono text-[13px] font-bold" style={{ color: 'var(--ff-primary)' }}>{label}</span>
              <p className="mt-2 text-[13px] text-[var(--ff-ink-dim)]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
