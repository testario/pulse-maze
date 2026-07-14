import { describe, expect, it } from 'vitest'

import { getMedian } from './median'

describe('getMedian', () => {
  it('возвращает центральное значение нечётного набора', () => {
    expect(getMedian([90, 70, 80])).toBe(80)
  })

  it('усредняет два центральных значения чётного набора', () => {
    expect(getMedian([100, 70, 80, 90])).toBe(85)
  })

  it('не изменяет исходный массив и возвращает null для пустого', () => {
    const values = [90, 70, 80]

    expect(getMedian(values)).toBe(80)
    expect(values).toEqual([90, 70, 80])
    expect(getMedian([])).toBeNull()
  })
})
