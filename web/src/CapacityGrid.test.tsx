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
  it('closes the editor after saving before the figures finish refreshing', async () => {
    let finishRefresh: (value: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(data))
      .mockResolvedValueOnce(response({ id: 5, weeklyHours: 32 }))
      .mockImplementationOnce(() => new Promise<Response>(resolve => { finishRefresh = resolve })))
    render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }))
    fireEvent.change(screen.getByLabelText('Hours per week'), { target: { value: '32' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    await screen.findByText('Updating capacity…')
    expect(screen.queryByLabelText('Hours per week')).toBeNull()
    await act(async () => {
      finishRefresh(response({ ...data, people: [{ ...data.people[0], weeklyHours: 32 }] }))
    })
    expect(await screen.findByText('Hours saved.')).toBeTruthy()
    expect(screen.getByText('12 h available')).toBeTruthy()
  })

  it('finishes a save for its original person and refreshes the current range', async () => {
    let finishSave: (value: Response) => void = () => {}
    let finishOldRead: (value: Response) => void = () => {}
    const initial = { ...data, people: [
      ...data.people, { id: 1, name: 'Ana Ferreira', weeklyHours: 40, allocatedHours: [30] },
    ] }
    const updated = {
      ...initial, from: '2026-01-12', to: '2026-01-18', weeks: ['2026-01-12'],
      people: [initial.people[0], { ...initial.people[1], weeklyHours: 32 }],
    }
    const fetch = vi.fn().mockResolvedValueOnce(response(initial))
      .mockImplementationOnce(() => new Promise<Response>(resolve => { finishSave = resolve }))
      .mockImplementationOnce(() => new Promise<Response>(resolve => { finishOldRead = resolve }))
      .mockResolvedValueOnce(response(updated))
    vi.stubGlobal('fetch', fetch)
    const view = render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }))
    fireEvent.change(screen.getByLabelText('Hours per week'), { target: { value: '16' } })
    fireEvent.click(screen.getByRole('button', { name: 'Edit weekly hours for Ana Ferreira' }))
    fireEvent.change(screen.getByLabelText('Hours per week'), { target: { value: '32' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    view.rerender(<CapacityGrid from="2026-01-12" to="2026-01-16" />)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3))
    await act(async () => { finishSave(response({ id: 1, weeklyHours: 32 })) })
    expect(await screen.findByText('32 h / week')).toBeTruthy()
    expect(fetch.mock.calls[1][0]).toBe('/api/people/1')
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ weeklyHours: 32 })
    expect(fetch.mock.calls[3][0]).toBe('/api/capacity?from=2026-01-12&to=2026-01-16')
    await act(async () => { finishOldRead(response(initial)) })
    expect(screen.getByText('32 h / week')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }))
    expect((screen.getByLabelText('Hours per week') as HTMLInputElement).value).toBe('16')
  })

  it('retries a failed post-save refresh without repeating the write', async () => {
    const updated = { ...data, people: [{ ...data.people[0], weeklyHours: 32 }] }
    const fetch = vi.fn().mockResolvedValueOnce(response(data))
      .mockResolvedValueOnce(response({ id: 5, weeklyHours: 32 }))
      .mockRejectedValueOnce(new Error('Read failed'))
      .mockResolvedValueOnce(response(updated))
    vi.stubGlobal('fetch', fetch)
    render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    const editButton = await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' })
    editButton.focus()
    fireEvent.click(editButton)
    fireEvent.change(screen.getByLabelText('Hours per week'), { target: { value: '32' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    await screen.findByText('Hours saved. Figures could not be updated.')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Retry loading' }))
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }))
    expect(await screen.findByText('12 h available')).toBeTruthy()
    expect(document.activeElement).toBe(editButton)
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(fetch.mock.calls.filter(([, options]) => options?.method === 'PATCH')).toHaveLength(1)
    expect(fetch.mock.calls[3][0]).toBe('/api/capacity?from=2026-01-05&to=2026-01-09')
  })

  it('switches people without losing drafts and cancels only the active draft', async () => {
    const fetch = vi.fn().mockResolvedValue(response({ ...data, people: [
      ...data.people, { id: 1, name: 'Ana Ferreira', weeklyHours: 40, allocatedHours: [30] },
    ] }))
    vi.stubGlobal('fetch', fetch)
    render(<CapacityGrid from="2026-01-05" to="2026-01-09" />)
    const eli = await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' })
    const ana = screen.getByRole('button', { name: 'Edit weekly hours for Ana Ferreira' })
    fireEvent.click(eli)
    fireEvent.change(screen.getByLabelText('Hours per week'), { target: { value: '32' } })
    expect((ana as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(ana)
    expect((screen.getByLabelText('Hours per week') as HTMLInputElement).value).toBe('40')
    fireEvent.change(screen.getByLabelText('Hours per week'), { target: { value: '36' } })
    fireEvent.click(eli)
    expect((screen.getByLabelText('Hours per week') as HTMLInputElement).value).toBe('32')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(eli)
    expect((screen.getByLabelText('Hours per week') as HTMLInputElement).value).toBe('0')
    fireEvent.click(ana)
    expect((screen.getByLabelText('Hours per week') as HTMLInputElement).value).toBe('36')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

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
    const editButton = await screen.findByRole('button', { name: 'Edit weekly hours for Eli Nakamura' })
    editButton.focus()
    fireEvent.click(editButton)
    const input = screen.getByLabelText('Hours per week') as HTMLInputElement
    fireEvent.change(input, { target: { value: '32' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Your entry is kept'))
    expect(input.value).toBe('32')
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(input.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id)
    expect(document.activeElement).toBe(input)
    fireEvent.click(screen.getByRole('button', { name: 'Save hours' }))
    expect(await screen.findByText('12 h available')).toBeTruthy()
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(screen.queryByLabelText('Hours per week')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }))
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
    expect((screen.getByRole('button', { name: 'Edit weekly hours for Eli Nakamura' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(saving)
    expect(fetch).toHaveBeenCalledTimes(2)
    await act(async () => { resolveSave(response({ id: 5, weeklyHours: 0 })) })
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3))
  })
})
