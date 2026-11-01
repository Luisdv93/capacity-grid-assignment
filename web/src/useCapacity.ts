import { useEffect, useState } from 'react'
import { request, type Capacity } from './api'

type LoadState = { key: string; range: string; data?: Capacity; error?: string }

export function useCapacity(from: string, to: string, revision: number) {
  const range = `${from}/${to}`
  const key = `${range}/${revision}`
  const [state, setState] = useState<LoadState>({ key: '', range: '' })
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    request<Capacity>(`/api/capacity?${new URLSearchParams({ from, to })}`, { signal: controller.signal })
      .then(data => { if (active) setState({ key, range, data }) })
      .catch((error: unknown) => {
        if (active) setState(previous => ({
          key, range, data: previous.range === range ? previous.data : undefined,
          error: error instanceof Error ? error.message : 'Could not load capacity. Try again.',
        }))
      })
    return () => { active = false; controller.abort() }
  }, [from, to, key, range])
  return state.key === key
    ? { ...state, loading: false }
    : { loading: true, data: state.range === range ? state.data : undefined, error: undefined }
}
