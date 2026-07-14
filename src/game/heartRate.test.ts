import { describe, expect, it } from 'vitest'

import { getRadialFactor, parseHeartRateMeasurement, smoothBpm } from './heartRate'

describe('heartRate', () => {
  it('сглаживает BPM экспоненциальным методом', () => {
    expect(smoothBpm(70, 90)).toBeCloseTo(73)
    expect(smoothBpm(70, 90, 0.5)).toBe(80)
  })

  it('возвращает полный фактор на заданных границах', () => {
    expect(getRadialFactor(60, 70)).toBe(-1)
    expect(getRadialFactor(85, 70)).toBe(0)
    expect(getRadialFactor(105, 70)).toBe(1)
  })

  it('линейно интерполирует фактор в асимметричных промежуточных диапазонах', () => {
    expect(getRadialFactor(72.5, 70)).toBeCloseTo(-0.5)
    expect(getRadialFactor(95, 70)).toBeCloseTo(0.5)
    expect(getRadialFactor(40, 70)).toBe(-1)
    expect(getRadialFactor(130, 70)).toBe(1)
  })

  it('читает 8-битный BPM из BLE Heart Rate Measurement', () => {
    const value = new DataView(new Uint8Array([0b00000000, 72]).buffer)

    expect(parseHeartRateMeasurement(value)).toBe(72)
  })

  it('читает 16-битный BPM из BLE Heart Rate Measurement', () => {
    const value = new DataView(new Uint8Array([0b00000001, 0x2c, 0x01]).buffer)

    expect(parseHeartRateMeasurement(value)).toBe(300)
  })

  it('отклоняет неполные BLE-измерения', () => {
    expect(parseHeartRateMeasurement(new DataView(new ArrayBuffer(0)))).toBeNull()
    expect(parseHeartRateMeasurement(new DataView(new Uint8Array([1, 72]).buffer))).toBeNull()
  })
})
