import { describe, expect, it } from 'vitest'

import { getRadialDirection, smoothBpm } from './heartRate'

describe('heartRate', () => {
  it('сглаживает BPM экспоненциальным методом', () => {
    expect(smoothBpm(70, 90)).toBeCloseTo(73)
    expect(smoothBpm(70, 90, 0.5)).toBe(80)
  })

  it('определяет направление за пределами нейтрального диапазона', () => {
    expect(getRadialDirection(79, 70)).toBe(1)
    expect(getRadialDirection(66, 70)).toBe(-1)
  })

  it('останавливает движение на порогах и в нейтральном диапазоне', () => {
    expect(getRadialDirection(78, 70)).toBe(0)
    expect(getRadialDirection(67, 70)).toBe(0)
    expect(getRadialDirection(70, 70)).toBe(0)
  })
})
