import { expect, it } from 'vitest'
import { hoursLabel } from './hours'

it('keeps large values bounded, small positive values visible, and zero unsigned', () => {
  expect(hoursLabel(1e308)).toBe('1E308')
  expect(hoursLabel(0.001)).toBe('<0.01')
  expect(hoursLabel(-0)).toBe('0')
  expect(hoursLabel(32.5)).toBe('32.5')
})
