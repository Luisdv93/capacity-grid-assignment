import { useState } from 'react'
import { CapacityGrid } from './CapacityGrid'
import { rangeError, shiftDate } from './dates'

export function App() {
  const [range, setRange] = useState({ from: '2025-12-29', to: '2026-01-16' })
  const [draft, setDraft] = useState(range)
  const [error, setError] = useState<string | null>(null)

  function move(days: number) {
    const next = { from: shiftDate(range.from, days), to: shiftDate(range.to, days) }
    const message = rangeError(next.from, next.to)
    if (message) { setError(message); return }
    setRange(next)
    setDraft(next)
    setError(null)
  }

  return (
    <main>
      <header className="page-header">
        <div><h1>Team capacity</h1><p>See the workload. Make room for what comes next.</p></div>
      </header>
      <section className="toolbar" aria-label="Date range">
        <div className="week-navigation">
          <button type="button" onClick={() => move(-7)}>Previous week</button>
          <button type="button" onClick={() => move(7)}>Next week</button>
        </div>
        <form className="range-form" onSubmit={event => {
          event.preventDefault()
          const message = rangeError(draft.from, draft.to)
          setError(message)
          if (!message) setRange(draft)
        }}>
          <label>From<input type="date" min="0001-01-01" max="9998-12-31" required value={draft.from} onChange={event => setDraft({ ...draft, from: event.target.value })} /></label>
          <label>To<input type="date" min="0001-01-01" max="9998-12-31" required value={draft.to} onChange={event => setDraft({ ...draft, to: event.target.value })} /></label>
          <button className="primary" type="submit">Apply range</button>
        </form>
      </section>
      {error ? <p className="error" role="alert">{error}</p> : null}
      <CapacityGrid from={range.from} to={range.to} />
    </main>
  )
}
