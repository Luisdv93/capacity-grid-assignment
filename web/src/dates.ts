export function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function rangeError(from: string, to: string): string | null {
  const valid = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01' || value > '9998-12-31') return false
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  }
  if (!valid(from) || !valid(to)) return 'Enter two valid dates.'
  if (to < from) return 'The end date must be on or after the start date.'
  const limit = new Date(`${from}T00:00:00Z`)
  limit.setUTCFullYear(limit.getUTCFullYear() + 2)
  if (to > limit.toISOString().slice(0, 10)) return 'Choose a range of at most two years.'
  return null
}

export function weekRange(from: string, to: string) {
  const day = (value: string) => (new Date(`${value}T00:00:00Z`).getUTCDay() + 6) % 7
  return { from: shiftDate(from, -day(from)), to: shiftDate(to, 6 - day(to)) }
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
export function dateLabel(value: string) {
  return dateFormat.format(new Date(`${value}T00:00:00Z`))
}
