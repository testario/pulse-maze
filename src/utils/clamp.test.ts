import { describe, expect, it } from 'vitest'

import { clamp } from './clamp'

describe('clamp', () => {
  it('ограничивает значение заданным диапазоном', () => {
    expect(clamp(20, 35, 220)).toBe(35)
    expect(clamp(70, 35, 220)).toBe(70)
    expect(clamp(240, 35, 220)).toBe(220)
  })
})
