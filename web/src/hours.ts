const hoursFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })
const largeHoursFormat = new Intl.NumberFormat('en-GB', { notation: 'scientific', maximumSignificantDigits: 3 })

export function hoursLabel(hours: number): string {
  if (hours !== 0 && Math.abs(hours) < 0.01) return '<0.01'
  if (Math.abs(hours) >= 1_000_000) return largeHoursFormat.format(hours)
  return hoursFormat.format(hours === 0 ? 0 : hours)
}
