import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Capacity } from './api'
import { useCapacity } from './useCapacity'

const person = { id: 1, name: 'Ana Ferreira', weeklyHours: 40, allocatedHours: [30] }
const data: Capacity = {
  from: '2026-01-05', to: '2026-01-11', weeks: ['2026-01-05'], people: [person],
}
const response = (body: unknown) => ({ ok: true, json: async () => body }) as Response

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it.each(['', '-1', 'Infinity'])('rejects an invalid draft through the module interface: %s', async draft => {
  const fetch = vi.fn().mockResolvedValue(response(data))
  vi.stubGlobal('fetch', fetch)
  const { result } = renderHook(() => useCapacity('2026-01-05', '2026-01-09'))
  await waitFor(() => expect(result.current.load.loading).toBe(false))
  act(() => result.current.actions.edit(person))
  act(() => result.current.actions.changeDraft(draft))
  await act(async () => { await result.current.actions.save() })
  expect(result.current.editor?.error?.kind).toBe('validation')
  expect(result.current.editor?.draft).toBe(draft)
  expect(fetch).toHaveBeenCalledTimes(1)
})

it('blocks duplicate writes through the module interface before the view can disable controls', async () => {
  let finishSave: (value: Response) => void = () => {}
  const fetch = vi.fn().mockResolvedValueOnce(response(data))
    .mockImplementationOnce(() => new Promise<Response>(resolve => { finishSave = resolve }))
    .mockResolvedValue(response(data))
  vi.stubGlobal('fetch', fetch)
  const { result } = renderHook(() => useCapacity('2026-01-05', '2026-01-09'))
  await waitFor(() => expect(result.current.load.loading).toBe(false))
  act(() => result.current.actions.edit(person))
  let firstSave: Promise<void> = Promise.resolve()
  act(() => {
    firstSave = result.current.actions.save()
    void result.current.actions.save()
  })
  expect(result.current.editor?.status).toBe('saving')
  expect(fetch).toHaveBeenCalledTimes(2)
  await act(async () => {
    finishSave(response({ id: 1, weeklyHours: 40 }))
    await firstSave
  })
  await waitFor(() => expect(result.current.load.loading).toBe(false))
  expect(result.current.editor).toBeNull()
  expect(result.current.load.afterSave).toBe(true)
  expect(fetch.mock.calls.filter(([, options]) => options?.method === 'PATCH')).toHaveLength(1)
})
