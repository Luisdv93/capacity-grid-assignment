import { hoursLabel } from './hours'

type Props = {
  allocatedHours: number
  weeklyHours: number
}

export function CapacityCell({ allocatedHours, weeklyHours }: Props) {
  const excess = allocatedHours - weeklyHours
  const available = Math.max(0, -excess)
  const className = excess > 0 ? 'over-capacity' : allocatedHours === 0 ? 'unallocated' : ''
  const status = excess > 0 ? `${excess} hours over capacity` : `${available} hours available`

  return (
    <td
      className={className}
      aria-label={`${allocatedHours} hours assigned; ${weeklyHours} hours capacity; ${status}`}
    >
      <div className="cell-hours">
        <strong>{hoursLabel(allocatedHours)} h</strong>
        <span> / {hoursLabel(weeklyHours)} h</span>
      </div>
      <div className="cell-detail">
        {excess > 0 ? (
          <span>Over by {hoursLabel(excess)} h</span>
        ) : allocatedHours === 0 ? (
          'No hours assigned'
        ) : (
          `${hoursLabel(-excess)} h available`
        )}
      </div>
    </td>
  )
}
