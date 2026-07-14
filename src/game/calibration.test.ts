import { describe, expect, it } from 'vitest'

import { CALIBRATION_DURATION_MS } from './config'
import { filterCalibrationBpm, getRestingBpm } from './calibration'

describe('calibration', () => {
  it('использует контракт калибровки в двадцать секунд', () => {
    expect(CALIBRATION_DURATION_MS).toBe(20_000)
  })

  it('отбрасывает BPM за допустимым диапазоном', () => {
    expect(filterCalibrationBpm([20, 35, 70, 220, 221, Number.NaN])).toEqual([35, 70, 220])
  })

  it('фиксирует resting BPM медианой валидных значений', () => {
    expect(getRestingBpm([20, 71, 69, 220, 221])).toBe(71)
    expect(getRestingBpm([20, 221])).toBeNull()
  })
})
