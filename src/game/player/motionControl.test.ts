import { describe, expect, it } from 'vitest'

import {
  getAngularDirectionFromTilt,
  getRadialFactorFromTilt,
} from './motionControl'

describe('getAngularDirectionFromTilt', () => {
  it('игнорирует отсутствие данных наклона', () => {
    expect(getAngularDirectionFromTilt(null, null, 0)).toBe(0)
    expect(getAngularDirectionFromTilt(Number.NaN, Number.NaN, 0)).toBe(0)
    expect(getAngularDirectionFromTilt(18, 0, Number.NaN)).toBe(0)
  })

  it('оставляет точку неподвижной внутри мёртвой зоны', () => {
    expect(getAngularDirectionFromTilt(8, 0, 0, 8)).toBe(0)
    expect(getAngularDirectionFromTilt(-8, 0, 0, 8)).toBe(0)
  })

  it('двигает точку по касательной от продольного наклона на правой стороне круга', () => {
    expect(getAngularDirectionFromTilt(18, 0, 0, 8, 28)).toBeCloseTo(0.25)
    expect(getAngularDirectionFromTilt(-18, 0, 0, 8, 28)).toBeCloseTo(-0.25)
  })

  it('двигает точку по касательной от бокового наклона на нижней стороне круга', () => {
    expect(getAngularDirectionFromTilt(0, 18, Math.PI / 2, 8, 28)).toBeCloseTo(-0.25)
    expect(getAngularDirectionFromTilt(0, -18, Math.PI / 2, 8, 28)).toBeCloseTo(0.25)
  })

  it('не двигает точку от наклона вдоль радиуса', () => {
    expect(getAngularDirectionFromTilt(18, 0, Math.PI / 2, 8, 28)).toBe(0)
  })

  it('ограничивает скорость полным значением при сильном касательном наклоне', () => {
    expect(getAngularDirectionFromTilt(32, 0, 0, 8, 28)).toBe(1)
    expect(getAngularDirectionFromTilt(-32, 0, 0, 8, 28)).toBe(-1)
  })
})

describe('getRadialFactorFromTilt', () => {
  it('двигает точку по радиусу от наклона вдоль радиального направления', () => {
    expect(getRadialFactorFromTilt(0, 18, 0, 8, 28)).toBeCloseTo(0.25)
    expect(getRadialFactorFromTilt(0, -18, 0, 8, 28)).toBeCloseTo(-0.25)
  })

  it('не меняет радиус от наклона по касательной', () => {
    expect(getRadialFactorFromTilt(18, 0, 0, 8, 28)).toBe(0)
  })
})
