import { memo, useState } from 'react'
import type { Capacity, Person } from './api'
import { dateLabel, shiftDate } from './dates'
import { hoursLabel } from './hours'

const ROW_HEIGHT = 68
const HEADER_HEIGHT = 70
const OVERSCAN = 5

export function CapacityTable({ data, onEdit, saving, hidden, regionId }: { data: Capacity; onEdit: (person: Person) => void; saving: boolean; hidden: boolean; regionId: string }) {
  const [scrollRow, setScrollRow] = useState(0)
  const start = Math.max(0, scrollRow - OVERSCAN)
  const count = Math.ceil(612 / ROW_HEIGHT) + OVERSCAN * 2
  const end = Math.min(data.people.length, start + count)

  return (
    <div id={regionId} className="grid-scroll" style={{ visibility: hidden ? 'hidden' : 'visible' }} inert={hidden} tabIndex={0} role="region" aria-label="Weekly capacity. Scroll to see more people and weeks."
      onScroll={event => setScrollRow(Math.floor(Math.max(0, event.currentTarget.scrollTop - HEADER_HEIGHT) / ROW_HEIGHT))}>
      <table className="capacity-table" aria-rowcount={data.people.length + 1} aria-colcount={data.weeks.length + 1}
        style={{ width: 260 + data.weeks.length * 182 }}>
        <caption className="sr-only">Assigned hours and weekly capacity for {data.people.length} people. Rows load as you scroll. Use the table scroll area to reach more people.</caption>
        <thead><tr><th scope="col" className="person-heading">Person <span>Weekly capacity</span></th>
          {data.weeks.map(week => <th scope="col" key={week}><span className="week-title">{dateLabel(week)}</span><span>to {dateLabel(shiftDate(week, 6))}</span></th>)}
        </tr></thead>
        <tbody>
          {start > 0 ? <tr aria-hidden="true"><td colSpan={data.weeks.length + 1} style={{ height: start * ROW_HEIGHT, padding: 0, border: 0 }} /></tr> : null}
          {data.people.slice(start, end).map((person, offset) => <PersonRow key={person.id} person={person} weeks={data.weeks} rowIndex={start + offset + 2} saving={saving}
            onEdit={onEdit} />)}
          {end < data.people.length ? <tr aria-hidden="true"><td colSpan={data.weeks.length + 1} style={{ height: (data.people.length - end) * ROW_HEIGHT, padding: 0, border: 0 }} /></tr> : null}
        </tbody>
      </table>
    </div>
  )
}

const PersonRow = memo(function PersonRow({ person, weeks, rowIndex, saving, onEdit }: {
  person: Person; weeks: string[]; rowIndex: number; saving: boolean; onEdit: (person: Person) => void
}) {
  return <tr aria-rowindex={rowIndex}>
    <th scope="row"><button className="person-button" disabled={saving} onClick={() => onEdit(person)} aria-label={`Edit weekly hours for ${person.name}`}>
      <span className="person-name" title={person.name}>{person.name}</span><span className="person-hours" title={`${person.weeklyHours} hours per week`}>{hoursLabel(person.weeklyHours)} h / week <span className="edit-label">Edit</span></span>
    </button></th>
    {person.allocatedHours.map((hours, index) => {
      const excess = hours - person.weeklyHours
      return <td key={weeks[index]} aria-label={`${hours} hours assigned; ${person.weeklyHours} hours capacity; ${excess > 0 ? `${excess} hours over capacity` : `${Math.max(0, -excess)} hours available`}`} className={excess > 0 ? 'over-capacity' : hours === 0 ? 'unallocated' : ''}>
        <div className="cell-hours"><strong>{hoursLabel(hours)} h</strong><span> / {hoursLabel(person.weeklyHours)} h</span></div>
        <div className="cell-detail">{excess > 0 ? <span>Over by {hoursLabel(excess)} h</span> : hours === 0 ? 'No hours assigned' : `${hoursLabel(-excess)} h available`}</div>
      </td>
    })}
  </tr>
})
