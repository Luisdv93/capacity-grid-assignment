import { memo } from 'react'
import type { Person } from './api'
import { CapacityCell } from './CapacityCell'
import { hoursLabel } from './hours'

type Props = {
  person: Person
  weeks: string[]
  rowIndex: number
  saving: boolean
  onEdit: (person: Person) => void
}

export const PersonRow = memo(function PersonRow({ person, weeks, rowIndex, saving, onEdit }: Props) {
  return (
    <tr aria-rowindex={rowIndex}>
      <th scope="row">
        <button
          className="person-button"
          disabled={saving}
          onClick={() => onEdit(person)}
          aria-label={`Edit weekly hours for ${person.name}`}
        >
          <span className="person-info">
            <span className="person-name" title={person.name}>
              {person.name}
            </span>
            <span className="person-hours" title={`${person.weeklyHours} hours per week`}>
              {hoursLabel(person.weeklyHours)} h / week
            </span>
          </span>
          <svg
            className="edit-icon"
            aria-hidden="true"
            focusable="false"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m16 3 5 5M3 21l5-1L21 7a2.83 2.83 0 0 0-4-4L4 16l-1 5Z" />
          </svg>
        </button>
      </th>
      {person.allocatedHours.map((hours, index) => (
        <CapacityCell
          key={weeks[index]}
          allocatedHours={hours}
          weeklyHours={person.weeklyHours}
        />
      ))}
    </tr>
  )
})
