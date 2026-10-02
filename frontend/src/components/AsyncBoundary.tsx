import type { ReactNode } from 'react'
import type { AsyncState } from '../hooks/useApi'

/** Generic loading / error / empty renderer so no page ever silently shows a misleading zero
 * when the API failed (Section 10.27). */
export function AsyncBoundary<T>({
  state, children, label,
}: {
  state: AsyncState<T>
  children: (data: T) => ReactNode
  label?: string
}) {
  if (state.status === 'loading') {
    return (
      <div className="flex items-center gap-3 py-8 text-sm text-[var(--ff-ink-dim)]">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2"
          style={{ borderColor: 'rgba(31,92,69,0.2)', borderTopColor: 'var(--ff-primary)' }}
        />
        Loading {label ?? 'data'} from validated simulation output…
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <div
        className="ff-surface p-4 text-sm"
        style={{ borderColor: 'rgba(200,92,74,0.35)', background: 'rgba(200,92,74,0.06)', color: '#8B2E20' }}
      >
        <p className="font-semibold">Could not load {label ?? 'data'}.</p>
        <p className="mt-1 opacity-80">{state.error}</p>
        <p className="mt-2 text-xs text-[var(--ff-ink-dim)]">
          The API may be unavailable. This page will not display a fabricated or zero value in
          place of real data.
        </p>
      </div>
    )
  }
  return <>{children(state.data)}</>
}
