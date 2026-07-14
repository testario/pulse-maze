import {
  HEART_RATE_INWARD_FULL_OFFSET_BPM,
  HEART_RATE_NEUTRAL_OFFSET_BPM,
  HEART_RATE_OUTWARD_FULL_OFFSET_BPM,
  HEART_RATE_SMOOTHING_FACTOR,
  RADIAL_FACTOR_MAX,
  RADIAL_FACTOR_MIN,
} from './config'
import { clamp } from '../utils/clamp'

/** Извлекает BPM из стандартного BLE Heart Rate Measurement. */
export function parseHeartRateMeasurement(value: DataView): number | null {
  if (value.byteLength < 2) {
    return null
  }

  const flags = value.getUint8(0)
  const isSixteenBit = (flags & 0b1) === 1

  if (isSixteenBit) {
    return value.byteLength >= 3 ? value.getUint16(1, true) : null
  }

  return value.getUint8(1)
}

/** Сглаживает следующее BPM экспоненциальным методом. */
export function smoothBpm(
  previousBpm: number,
  currentBpm: number,
  smoothingFactor = HEART_RATE_SMOOTHING_FACTOR,
): number {
  return previousBpm + smoothingFactor * (currentBpm - previousBpm)
}

/** Вычисляет непрерывный фактор радиального движения по сглаженному BPM. */
export function getRadialFactor(
  smoothedBpm: number,
  restingBpm: number,
): number {
  const inwardPoint = restingBpm + HEART_RATE_INWARD_FULL_OFFSET_BPM
  const neutralPoint = restingBpm + HEART_RATE_NEUTRAL_OFFSET_BPM
  const outwardPoint = neutralPoint + HEART_RATE_OUTWARD_FULL_OFFSET_BPM

  if (smoothedBpm <= inwardPoint) {
    return RADIAL_FACTOR_MIN
  }

  if (smoothedBpm < neutralPoint) {
    const factor = RADIAL_FACTOR_MIN + (
      (smoothedBpm - inwardPoint) / (neutralPoint - inwardPoint)
    )

    return clamp(factor, RADIAL_FACTOR_MIN, 0)
  }

  if (smoothedBpm >= outwardPoint) {
    return RADIAL_FACTOR_MAX
  }

  const factor = (smoothedBpm - neutralPoint) / (outwardPoint - neutralPoint)

  return clamp(factor, 0, RADIAL_FACTOR_MAX)
}
