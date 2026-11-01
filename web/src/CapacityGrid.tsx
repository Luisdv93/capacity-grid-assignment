import { useCallback, useEffect, useId, useRef } from 'react'
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
  const { load, editor, actions } = useCapacity(from, to)
  const { data, loading, error, afterSave } = load
  const saving = editor?.status === 'saving'
  const personId = editor?.person.id ?? null
  const scrollId = useId()
  const returnFocus = useRef<HTMLElement | null>(null)
  const effective = weekRange(from, to)

  const edit = useCallback((next: Person) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    actions.edit(next)
  }, [actions.edit])

  useEffect(() => {
    if (personId !== null || returnFocus.current === null) return
    const target = returnFocus.current.isConnected
      ? returnFocus.current
      : document.getElementById(scrollId)
    target?.focus()
    returnFocus.current = null
  }, [personId, scrollId])

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
      {editor ? (
        <CapacityEditor
          key={editor.person.id}
          editor={editor}
          onDraftChange={actions.changeDraft}
          onSave={actions.save}
          onClose={actions.close}
        />
      ) : null}
      <div className="grid-stage">
        {loading ? (
          <div className="load-state" role="status">
            <span className="loading-bar" />
            <h2>{afterSave ? 'Updating capacity…' : 'Loading capacity…'}</h2>
            <p>Fetching the people and weeks in this range.</p>
          </div>
        ) : null}
        {error ? (
          <div className="load-state" role="alert">
            <h2>
              {afterSave
                ? 'Hours saved. Figures could not be updated.'
                : 'Capacity could not be loaded.'}
            </h2>
            <p>{error}</p>
            <button onClick={actions.retry}>Retry loading</button>
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
