import { useEffect, useId, useRef, useState } from 'react'
import { request, type Person } from './api'

export function CapacityEditor({ person, onSaved, onClose, onPending }: {
  person: Person
  onSaved: () => void
  onClose: () => void
  onPending: (pending: boolean) => void
}) {
  const inputId = useId()
  const descriptionId = useId()
  const errorId = useId()
  const [draft, setDraft] = useState(String(person.weeklyHours))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const saving = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const hours = Number(draft)
  const invalid = draft.trim() === '' || !Number.isFinite(hours) || hours < 0
  useEffect(() => { if (!pending) input.current?.focus() }, [pending])

  async function save() {
    if (saving.current) return
    if (invalid) {
      setError('Enter weekly hours of zero or more.')
      return
    }
    saving.current = true
    setPending(true)
    onPending(true)
    setError('')
    setSaved(false)
    try {
      await request(`/api/people/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyHours: hours }),
      })
      setSaved(true)
      onSaved()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not confirm the save. Try again.')
    } finally {
      saving.current = false
      setPending(false)
      onPending(false)
    }
  }

  return (
    <section className="editor" aria-label={`Edit capacity for ${person.name}`}>
      <div className="editor-heading"><h2>{person.name}</h2><p id={descriptionId}>This changes capacity for every week, including past weeks. Assigned hours stay the same.</p></div>
      <form aria-busy={pending} onSubmit={event => { event.preventDefault(); void save() }}>
        <label htmlFor={inputId}>Hours per week</label>
        <div className="editor-controls">
          <input id={inputId} type="number" min="0" step="any" required ref={input} value={draft}
            disabled={pending} aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId} aria-invalid={Boolean(error) && invalid}
            onChange={event => { setDraft(event.target.value); setSaved(false); setError('') }} />
          <button className="primary" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save hours'}</button>
          <button type="button" onClick={onClose} disabled={pending}>{saved ? 'Done' : 'Cancel'}</button>
        </div>
        {error ? <p id={errorId} className="error" role="alert">{error} Your entry is kept; retry Save hours.</p> : null}
        {saved ? <p className="success" role="status">Hours saved.</p> : null}
      </form>
    </section>
  )
}
