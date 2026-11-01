import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { Person } from './api'
import { CapacityEditor } from './CapacityEditor'
import { CapacityTable } from './CapacityTable'
import { dateLabel, weekRange } from './dates'
import { useCapacity } from './useCapacity'

type Props = {
  from: string
  to: string
}

export function CapacityGrid({ from, to }: Props) {
  const [revision, setRevision] = useState(0)
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [person, setPerson] = useState<Person | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const scrollId = useId()
  const returnFocus = useRef<HTMLElement | null>(null)
  const { data, loading, error } = useCapacity(from, to, revision)
  const effective = weekRange(from, to)

  const edit = useCallback((next: Person) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setPerson(next)
    setSaved(false)
  }, [])

  useEffect(() => {
    if (person !== null || returnFocus.current === null) return
    const target = returnFocus.current.isConnected
      ? returnFocus.current
      : document.getElementById(scrollId)
    target?.focus()
    returnFocus.current = null
  }, [person, scrollId])

  function refresh() {
    setRevision(value => value + 1)
  }

  function finishSave() {
    setSaved(true)
    refresh()
  }

  function changeDraft(draft: string) {
    if (!person) return
    setDrafts(previous => ({ ...previous, [person.id]: draft }))
  }

  function closeEditor() {
    if (!person) return
    setDrafts(previous => {
      const remaining = { ...previous }
      delete remaining[person.id]
      return remaining
    })
    setPerson(null)
  }

  return (
    <section aria-label="Team capacity grid">
      <div className="grid-summary">
        <div>
          <p>
            <strong>{dateLabel(effective.from)} – {dateLabel(effective.to)}</strong>
          </p>
          <div className="grid-context">
            <span>Full weeks · Monday–Friday hours</span>
            <span className="legend">
              <span className="legend-mark" aria-hidden="true" />Over capacity
            </span>
          </div>
        </div>
        {data ? (
          <span>{data.people.length} people · {data.weeks.length} weeks</span>
        ) : null}
      </div>
      {person ? (
        <CapacityEditor
          key={person.id}
          person={person}
          draft={drafts[person.id] ?? String(person.weeklyHours)}
          onPending={setSaving}
          onDraftChange={changeDraft}
          onSaved={finishSave}
          onClose={closeEditor}
        />
      ) : null}
      <div className="grid-stage">
        {loading ? (
          <div className="load-state" role="status">
            <span className="loading-bar" />
            <h2>{saved ? 'Updating capacity…' : 'Loading capacity…'}</h2>
            <p>Fetching the people and weeks in this range.</p>
          </div>
        ) : null}
        {error ? (
          <div className="load-state" role="alert">
            <h2>
              {saved
                ? 'Hours saved. Figures could not be updated.'
                : 'Capacity could not be loaded.'}
            </h2>
            <p>{error}</p>
            <button onClick={refresh}>Retry loading</button>
          </div>
        ) : null}
        {data && data.people.length > 0 ? (
          <CapacityTable
            key={`${from}/${to}`}
            data={data}
            regionId={scrollId}
            hidden={loading || Boolean(error)}
            saving={saving}
            onEdit={edit}
          />
        ) : null}
        {data && data.people.length === 0 ? (
          <div className="load-state">
            <h2>No people to show</h2>
            <p>There are no people in this team.</p>
          </div>
        ) : null}
      </div>
      <p className="grid-footnote">
        Hours assigned / weekly capacity. Select a person to edit capacity.
        Scroll for more people and weeks.
      </p>
    </section>
  )
}
