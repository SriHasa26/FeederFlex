import { useEffect, useRef, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }

/** Fetches once per dependency-array change. Never fabricates a fallback value on error --
 * callers must render the 'error' state explicitly (Section 10.27). */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const seq = useRef(0)

  useEffect(() => {
    const mySeq = ++seq.current
    setState({ status: 'loading' })
    fetcher()
      .then((data) => {
        if (mySeq === seq.current) setState({ status: 'success', data })
      })
      .catch((err: unknown) => {
        if (mySeq === seq.current) {
          setState({ status: 'error', error: err instanceof Error ? err.message : String(err) })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
