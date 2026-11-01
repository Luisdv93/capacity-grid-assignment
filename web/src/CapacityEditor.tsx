import { useEffect, useId, useRef } from 'react'
import type { CapacityEdit } from './useCapacity'

type Props = {
  editor: CapacityEdit
  onDraftChange: (draft: string) => void
  onSave: () => Promise<void>
  onClose: () => void
}

export function CapacityEditor({ editor, onDraftChange, onSave, onClose }: Props) {
  const { person, draft, status, error } = editor
  const inputId = useId()
  const descriptionId = useId()
  const errorId = useId()
  const input = useRef<HTMLInputElement>(null)
  const pending = status === 'saving'
  const saved = status === 'saved'

  useEffect(() => {
    if (!pending) input.current?.focus()
  }, [pending])

  return (
    <section className="editor" aria-label={`Edit capacity for ${person.name}`}>
      <div className="editor-heading">
        <h2>{person.name}</h2>
        <p id={descriptionId}>
          This changes capacity for every week, including past weeks. Assigned hours stay the same.
        </p>
      </div>
      <form aria-busy={pending} onSubmit={event => {
        event.preventDefault()
        void onSave()
      }}>
        <label htmlFor={inputId}>Hours per week</label>
        <div className="editor-controls">
          <input
            id={inputId}
            type="number"
            min="0"
            step="any"
            required
            ref={input}
            value={draft}
            disabled={pending}
            aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
            aria-invalid={error?.kind === 'validation'}
            onChange={event => onDraftChange(event.target.value)}
          />
          <button className="primary" type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save hours'}
          </button>
          <button type="button" onClick={onClose} disabled={pending}>
            {saved ? 'Done' : 'Cancel'}
          </button>
        </div>
        {error ? (
          <p id={errorId} className="error" role="alert">
            {error.message} Your entry is kept; retry Save hours.
          </p>
        ) : null}
        {saved ? <p className="success" role="status">Hours saved.</p> : null}
      </form>
    </section>
  )
}
