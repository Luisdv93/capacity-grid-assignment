import { useCallback, useRef, useState } from 'react'
import type { Person } from './api'
import { CapacityEditor } from './CapacityEditor'
import { CapacityTable } from './CapacityTable'
import { dateLabel, weekRange } from './dates'
import { useCapacity } from './useCapacity'

type Props = { from: string; to: string }

export function CapacityGrid({ from, to }: Props) {
  const [revision, setRevision] = useState(0)
  const [person, setPerson] = useState<Person | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const returnFocus = useRef<HTMLElement | null>(null)
  const { data, loading, error } = useCapacity(from, to, revision)
  const effective = weekRange(from, to)
  const edit = useCallback((next: Person) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setPerson(next)
    setSaved(false)
  }, [])

  return <section aria-label="Team capacity grid">
    <div className="grid-summary">
      <p><strong>{dateLabel(effective.from)} – {dateLabel(effective.to)}</strong><span>Full weeks · Monday–Friday hours</span></p>
      {data ? <span>{data.people.length} people · {data.weeks.length} weeks</span> : null}
    </div>
    {person ? <CapacityEditor key={person.id} person={person} onPending={setSaving}
      onSaved={() => { setSaved(true); setRevision(value => value + 1) }}
      onClose={() => { setPerson(null); if (returnFocus.current?.isConnected) returnFocus.current.focus(); else document.getElementById('capacity-scroll')?.focus() }} /> : null}
    <div className="grid-stage">
    {loading ? <div className="load-state" role="status"><span className="loading-bar" /><h2>{saved ? 'Updating capacity…' : 'Loading capacity…'}</h2><p>Fetching the people and weeks in this range.</p></div> : null}
    {error ? <div className="load-state" role="alert"><h2>{saved ? 'Hours saved. Figures could not be updated.' : 'Capacity could not be loaded.'}</h2><p>{error}</p><button onClick={() => setRevision(value => value + 1)}>Retry loading</button></div> : null}
    {data ? data.people.length > 0 ? <CapacityTable key={`${from}/${to}`} data={data} hidden={loading || Boolean(error)} saving={saving || person !== null} onEdit={edit} /> : <div className="load-state"><h2>No people to show</h2><p>There are no people in this team.</p></div> : null}
    </div>
    <p className="grid-footnote">Hours assigned / weekly capacity. Select a person to edit capacity. Scroll for more people and weeks.</p>
  </section>
}
