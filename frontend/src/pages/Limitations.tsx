import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { PageHeader } from '../components/PageHeader'
import type { LimitationItem } from '../types/api'

export function Limitations() {
  const state = useApi(() => api.limitations(), [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Scope discipline" title="Limitations" subtitle="Consolidated from Phases 4A-9. Nothing here is hidden or softened." />

      <AsyncBoundary state={state} label="limitations">
        {(data) => {
          const groups = data.items.reduce<Record<string, LimitationItem[]>>((acc, item) => {
            ;(acc[item.category] ??= []).push(item)
            return acc
          }, {})
          return (
            <div className="flex flex-col gap-6">
              {Object.entries(groups).map(([category, items]) => (
                <div key={category} className="ff-card p-5">
                  <h2 className="ff-display mb-3 text-[15px] font-bold text-[var(--ff-ink)]">{category}</h2>
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                      <li key={item.text} className="flex gap-2 text-sm text-[var(--ff-ink-dim)]">
                        <span style={{ color: 'var(--ff-warn)' }}>—</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        }}
      </AsyncBoundary>
    </div>
  )
}
