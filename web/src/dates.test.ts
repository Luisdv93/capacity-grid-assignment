import { describe, expect, it } from 'vitest'
import { rangeError, shiftDate, weekRange } from './dates'

describe('weekly dates', () => {
  it('expands partial weeks across the year boundary without local time offsets', () => {
    expect(weekRange('2025-12-31', '2026-01-09')).toEqual({ from: '2025-12-29', to: '2026-01-11' })
    expect(shiftDate('2026-03-08', 7)).toBe('2026-03-15')
  })
  it('validates real dates and limits the selected range before expansion', () => {
    expect(rangeError('2026-02-30', '2026-03-01')).not.toBeNull()
    expect(rangeError('2026-01-09', '2026-01-01')).not.toBeNull()
    expect(rangeError('2026-01-01', '2028-01-01')).toBeNull()
    expect(rangeError('2026-01-01', '2028-01-02')).not.toBeNull()
  })
})
