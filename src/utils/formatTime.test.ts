import { describe, expect, it } from 'vitest'

import { formatGameTime } from './formatTime'

describe('formatGameTime', () => {
  it('форматирует минуты, секунды и часы', () => {
    expect(formatGameTime(0)).toBe('00:00')
    expect(formatGameTime(61_000)).toBe('01:01')
    expect(formatGameTime(3_661_000)).toBe('01:01:01')
  })
})
