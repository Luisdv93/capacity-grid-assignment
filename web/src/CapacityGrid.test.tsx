import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CapacityGrid } from './CapacityGrid'
import type { Capacity } from './api'

const data: Capacity = {
  from: '2026-01-05', to: '2026-01-11', weeks: ['2026-01-05'],
  people: [{ id: 5, name: 'Eli Nakamura', weeklyHours: 0, allocatedHours: [20] }],
}
const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('capacity interactions', () => {
  it('shows positive allocation at zero capacity without an infinite percentage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(data)))
    render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    expect(await screen.findByText('Over by 20 h')).toBeTruthy()
    expect(screen.queryByText(/Infinity|NaN/)).toBeNull()
  })

  it('keeps the draft after a failed save and lets the user retry', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(response(data))
      .mockResolvedValueOnce(response({ error: 'Could not save weekly hours. Try again.' }, false))
      .mockResolvedValueOnce(response({ id: 5, weeklyHours: 32 }))
      .mockResolvedValueOnce(response({ ...data, people: [{ ...data.people[0], weeklyHours: 32 }] }))
    vi.stubGlobal('fetch', fetch)
    render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }))
    const input = screen.getByLabelText('Hours per week') as HTMLInputElement
    fireEvent.change(input, { target: { value: '32' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Your entry is kept'))
    expect(input.value).toBe('32')
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    expect(await screen.findByText('12 h available')).toBeTruthy()
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('distinguishes a saved edit from a failed refresh', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(data))
      .mockResolvedValueOnce(response({ id: 5, weeklyHours: 32 }))
      .mockRejectedValueOnce(new Error('Network unavailable')))
    render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }))
    fireEvent.change(screen.getByLabelText('Hours per week'), { target: { value: '32' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    expect(await screen.findByText('Hours saved. Figures could not be updated.')).toBeTruthy()
    expect(screen.getByText('Over by 20 h').closest('[inert]')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Retry loading' })).toBeTruthy()
  })

  it('ignores a late response even when transport does not honor abort', async () => {
    let resolveOld: (value: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(() => new Promise<Response>(resolve => { resolveOld = resolve }))
      .mockResolvedValueOnce(response({ ...data, people: [{ ...data.people[0], name: 'Current person' }] })))
    const view = render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    view.rerender(<CapacityGrid from="2026-01-12" to="2026-01-16" />)
    await screen.findByText('Current person')
    await act(async () => { resolveOld(response(data)) })
    expect(screen.queryByText('Eli Nakamura')).toBeNull()
    expect(screen.getByText('Current person')).toBeTruthy()
  })

  it('prevents repeat writes while the save is pending', async () => {
    let resolveSave: (value: Response) => void = () => {}
    const fetch = vi.fn().mockResolvedValueOnce(response(data))
      .mockImplementationOnce(() => new Promise<Response>(resolve => { resolveSave = resolve }))
      .mockResolvedValue(response(data))
    vi.stubGlobal('fetch', fetch)
    render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    const saving = screen.getByRole('button', { name: 'Saving…' }) as HTMLButtonElement
    expect(saving.disabled).toBe(true)
    fireEvent.click(saving)
    expect(fetch).toHaveBeenCalledTimes(2)
    await act(async () => { resolveSave(response({ id: 5, weeklyHours: 0 })) })
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3))
  })
})
