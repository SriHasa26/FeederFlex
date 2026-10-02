import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { PageHeader } from '../components/PageHeader'
import type { EvidenceClaim } from '../types/api'

const GROUP_STYLE = {
  supported: { border: 'rgba(31,92,69,0.35)', bg: 'rgba(143,191,122,0.14)', color: 'var(--ff-primary)' },
  conditional: { border: 'rgba(184,118,58,0.4)', bg: 'rgba(184,118,58,0.12)', color: 'var(--ff-counterfactual)' },
  not_established: { border: 'var(--ff-line-strong)', bg: 'var(--ff-surface-sunken)', color: 'var(--ff-ink-faint)' },
}

export function Evidence() {
  const state = useApi(() => api.evidence(), [])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Credibility" title="Evidence & Claims" subtitle="Every claim this project could make, classified by what actually supports it." />

      <AsyncBoundary state={state} label="evidence classification">
        {(data) => (
          <>
            <ClaimGroup title="Supported by simulation" style={GROUP_STYLE.supported} claims={data.supported} />
            <ClaimGroup title="Conditional / Counterfactual" style={GROUP_STYLE.conditional} claims={data.conditional_counterfactual} />
            <ClaimGroup title="Not established" style={GROUP_STYLE.not_established} claims={data.not_established} />
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}

function ClaimGroup({ title, style, claims }: { title: string; style: { border: string; bg: string; color: string }; claims: EvidenceClaim[] }) {
  return (
    <div>
      <h2 className="ff-display mb-3 text-[18px] font-bold text-[var(--ff-ink)]">{title}</h2>
      <div className="flex flex-col gap-2">
        {claims.map((c) => (
          <div key={c.claim} className="ff-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="ff-mono rounded-md border px-2 py-0.5 text-[10px] font-medium"
                style={{ borderColor: style.border, background: style.bg, color: style.color }}
              >
                {c.evidence_type}
              </span>
              <span className="font-medium text-[var(--ff-ink)]">{c.claim}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--ff-ink-dim)]">{c.qualification}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
