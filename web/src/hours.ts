const hoursFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })
export const hoursLabel = (hours: number) => hours !== 0 && Math.abs(hours) < 0.01 ? '<0.01' : hoursFormat.format(hours === 0 ? 0 : hours)

