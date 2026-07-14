import { describe, expect, it } from 'vitest'

import { FULL_CIRCLE_ANGLE } from '../config'
import { normalizeAngle } from './polarMath'

describe('normalizeAngle', () => {
  it('оставляет угол внутри нормализованного диапазона', () => {
    expect(normalizeAngle(Math.PI / 3)).toBeCloseTo(Math.PI / 3)
  })

  it('нормализует угол больше полного оборота', () => {
    expect(normalizeAngle(FULL_CIRCLE_ANGLE + Math.PI / 4)).toBeCloseTo(Math.PI / 4)
  })

  it('нормализует отрицательный угол', () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(Math.PI * 1.5)
  })

  it('возвращает ноль для полного оборота в любом направлении', () => {
    expect(normalizeAngle(FULL_CIRCLE_ANGLE)).toBe(0)
    expect(normalizeAngle(-FULL_CIRCLE_ANGLE)).toBe(0)
  })
})
