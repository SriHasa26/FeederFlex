import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { PageHeader } from '../components/PageHeader'
import { formatPct, formatW, formatWh } from '../utils/format'

export function Results() {
  const results = useApi(() => api.results(), [])
  const forecast = useApi(() => api.forecast(1), [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Final evaluation"
        title="Validated Results"
        subtitle="Numbers below trace directly to Phase 9's validated evaluation JSON — nothing here is recomputed by this application."
      />

      <AsyncBoundary state={results} label="validated results">
        {(data) => {
          const baseline = (data.baseline as any)?.by_participation?.participation_90
          const broad = (data.counterfactual as any)?.results?.counterfactual_broad
          const ac = (data.counterfactual as any)?.results?.counterfactual_ac_enabled
          const fairness = data.fairness as any
          const recon = (data as any).restoration_and_duration

          return (
            <>
              <Section title="1. Evidence-backed baseline">
                <Grid>
                  <Cell label="Available flexibility" value="0 W" accent="teal" />
                  <Cell label="Requested flexibility" value={formatWh(baseline?.requested_flexibility_wh)} />
                  <Cell label="Delivered flexibility" value={formatWh(baseline?.delivered_flexibility_wh)} />
                  <Cell label="Unmet flexibility" value={formatWh(baseline?.unmet_flexibility_wh)} accent="amber" />
                </Grid>
              </Section>

              <Section title="2. Counterfactual Broad (90% participation)">
                <Grid>
                  <Cell label="Peak reduction" value={formatW(broad?.participation_90?.peak_reduction_w)} accent="teal" />
                  <Cell label="Curtailed energy" value={formatWh(broad?.participation_90?.delivered_flexibility_wh)} accent="teal" />
                  <Cell label="Unmet flexibility" value={formatWh(broad?.participation_90?.unmet_flexibility_wh)} accent="amber" />
                  <Cell label="Shortfall coverage" value={formatPct((broad?.participation_90?.shortfall_coverage_ratio ?? 0) * 100)} />
                </Grid>
              </Section>

              <Section title="3. Counterfactual AC-enabled">
                <p className="mb-3 text-xs font-medium" style={{ color: 'var(--ff-counterfactual)' }}>
                  Driven by n=1 — exactly one AC-owning household exists in this population.
                </p>
                <Grid>
                  <Cell label="Delivered (30%/90%)" value={formatWh(ac?.participation_90?.delivered_flexibility_wh)} />
                  <Cell label="Delivered (50%/70%)" value={formatWh(ac?.participation_50?.delivered_flexibility_wh)} />
                </Grid>
              </Section>

              <Section title="4. Fairness / intervention distribution">
                <Grid>
                  <Cell label="Households intervened" value={String(fairness?.n_households_with_any_intervention ?? '—')} />
                  <Cell label="Median interventions" value={String(fairness?.intervention_count_distribution?.median ?? '—')} />
                  <Cell label="Max interventions" value={String(fairness?.intervention_count_distribution?.max ?? '—')} />
                  <Cell label="Mean interventions" value={String((fairness?.intervention_count_distribution?.mean ?? 0).toFixed(1))} />
                </Grid>
                <p className="mt-3 text-xs text-[var(--ff-ink-faint)]">
                  Descriptive only — no fairness score or equalization objective exists in the
                  validated methodology.
                </p>
              </Section>

              <Section title="5. Restoration & duration">
                <Grid>
                  <Cell label="Max realized duration" value={`${recon?.duration_max ?? '—'} steps`} />
                  <Cell label="Mean realized duration" value={`${(recon?.duration_mean ?? 0).toFixed(2)} steps`} />
                  <Cell label="Exceeding limit" value={String(recon?.n_exceeding_max_duration ?? '—')} accent={recon?.n_exceeding_max_duration === 0 ? 'teal' : 'amber'} />
                </Grid>
              </Section>
            </>
          )
        }}
      </AsyncBoundary>

      <Section title="6. Forecast performance (context only — not consumed by the controller)">
        <AsyncBoundary state={forecast} label="forecast performance">
          {(f) => (
            <div className="flex flex-wrap gap-4">
              {Object.entries(f.model_comparison_mae_w).map(([model, mae]) => (
                <Cell key={model} label={model} value={formatW(mae)} />
              ))}
            </div>
          )}
        </AsyncBoundary>
        <p className="mt-3 text-xs text-[var(--ff-ink-faint)]">{'The Phase 8 controller does NOT consume this forecast output. Dispatch is a retrospective simulation using actual/derived historical load.'}</p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ff-card p-5">
      <h2 className="ff-display mb-4 text-[15px] font-bold text-[var(--ff-ink)]">{title}</h2>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{children}</div>
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: 'teal' | 'amber' }) {
  const color = accent === 'teal' ? 'var(--ff-primary)' : accent === 'amber' ? 'var(--ff-counterfactual)' : 'var(--ff-ink)'
  return (
    <div className="flex flex-col gap-0.5">
      <span className="ff-mono text-[10px] uppercase tracking-wide text-[var(--ff-ink-faint)]">{label}</span>
      <span className="ff-mono text-lg font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}
