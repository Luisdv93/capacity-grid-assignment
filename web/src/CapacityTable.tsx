import { useState } from 'react'
import type { Capacity, Person } from './api'
import { dateLabel, shiftDate } from './dates'
import { PersonRow } from './PersonRow'

const ROW_HEIGHT = 68
const HEADER_HEIGHT = 70
const OVERSCAN = 5

type Props = {
  data: Capacity
  onEdit: (person: Person) => void
  saving: boolean
  hidden: boolean
  regionId: string
}

export function CapacityTable({ data, onEdit, saving, hidden, regionId }: Props) {
  const [scrollRow, setScrollRow] = useState(0)
  const start = Math.max(0, scrollRow - OVERSCAN)
  const count = Math.ceil(612 / ROW_HEIGHT) + OVERSCAN * 2
  const end = Math.min(data.people.length, start + count)

  return (
    <div
      id={regionId}
      className="grid-scroll"
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      inert={hidden}
      tabIndex={0}
      role="region"
      aria-label="Weekly capacity. Scroll to see more people and weeks."
      onScroll={event => {
        const offset = Math.max(0, event.currentTarget.scrollTop - HEADER_HEIGHT)
        setScrollRow(Math.floor(offset / ROW_HEIGHT))
      }}
    >
      <table
        className="capacity-table"
        aria-rowcount={data.people.length + 1}
        aria-colcount={data.weeks.length + 1}
        style={{ width: 260 + data.weeks.length * 182 }}
      >
        <caption className="sr-only">
          Assigned hours and weekly capacity for {data.people.length} people.
          Rows load as you scroll. Use the table scroll area to reach more people.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="person-heading">
              Person <span>Weekly capacity</span>
            </th>
            {data.weeks.map(week => (
              <th scope="col" key={week}>
                <span className="week-title">{dateLabel(week)}</span>
                <span>to {dateLabel(shiftDate(week, 6))}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {start > 0 ? (
            <tr aria-hidden="true">
              <td
                colSpan={data.weeks.length + 1}
                style={{ height: start * ROW_HEIGHT, padding: 0, border: 0 }}
              />
            </tr>
          ) : null}
          {data.people.slice(start, end).map((person, offset) => (
            <PersonRow
              key={person.id}
              person={person}
              weeks={data.weeks}
              rowIndex={start + offset + 2}
              saving={saving}
              onEdit={onEdit}
            />
          ))}
          {end < data.people.length ? (
            <tr aria-hidden="true">
              <td
                colSpan={data.weeks.length + 1}
                style={{
                  height: (data.people.length - end) * ROW_HEIGHT,
                  padding: 0,
                  border: 0,
                }}
              />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
