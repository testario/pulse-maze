import { describe, expect, it } from 'vitest'

import {
  HEART_RATE_BASELINE_BPM,
  HEART_RATE_INWARD_FULL_OFFSET_BPM,
  HEART_RATE_NEUTRAL_OFFSET_BPM,
  HEART_RATE_OUTWARD_FULL_OFFSET_BPM,
} from './config'
import { getRadialFactor, parseHeartRateMeasurement, smoothBpm } from './heartRate'

const inwardPoint = HEART_RATE_BASELINE_BPM + HEART_RATE_INWARD_FULL_OFFSET_BPM
const neutralPoint = HEART_RATE_BASELINE_BPM + HEART_RATE_NEUTRAL_OFFSET_BPM
const outwardPoint = neutralPoint + HEART_RATE_OUTWARD_FULL_OFFSET_BPM

describe('heartRate', () => {
  it('сглаживает BPM экспоненциальным методом', () => {
    expect(smoothBpm(70, 90)).toBeCloseTo(73)
    expect(smoothBpm(70, 90, 0.5)).toBe(80)
  })

  it('возвращает полный фактор на заданных границах', () => {
    expect(getRadialFactor(inwardPoint, HEART_RATE_BASELINE_BPM)).toBe(-1)
    expect(getRadialFactor(neutralPoint, HEART_RATE_BASELINE_BPM)).toBe(0)
    expect(getRadialFactor(outwardPoint, HEART_RATE_BASELINE_BPM)).toBe(1)
  })

  it('линейно интерполирует фактор в асимметричных промежуточных диапазонах', () => {
    expect(getRadialFactor((inwardPoint + neutralPoint) / 2, HEART_RATE_BASELINE_BPM)).toBeCloseTo(-0.5)
    expect(getRadialFactor((neutralPoint + outwardPoint) / 2, HEART_RATE_BASELINE_BPM)).toBeCloseTo(0.5)
    expect(getRadialFactor(inwardPoint - 20, HEART_RATE_BASELINE_BPM)).toBe(-1)
    expect(getRadialFactor(outwardPoint + 20, HEART_RATE_BASELINE_BPM)).toBe(1)
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
