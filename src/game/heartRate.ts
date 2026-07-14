import {
  HEART_RATE_INWARD_THRESHOLD,
  HEART_RATE_OUTWARD_THRESHOLD,
  HEART_RATE_SMOOTHING_FACTOR,
} from './config'
import type { RadialDirection } from './types'

/** Сглаживает следующее BPM экспоненциальным методом. */
export function smoothBpm(
  previousBpm: number,
  currentBpm: number,
  smoothingFactor = HEART_RATE_SMOOTHING_FACTOR,
): number {
  return previousBpm + smoothingFactor * (currentBpm - previousBpm)
}

/** Определяет направление радиального движения по сглаженному BPM. */
export function getRadialDirection(
  smoothedBpm: number,
  baselineBpm: number,
): RadialDirection {
  if (smoothedBpm > baselineBpm + HEART_RATE_OUTWARD_THRESHOLD) {
    return 1
  }

  if (smoothedBpm < baselineBpm - HEART_RATE_INWARD_THRESHOLD) {
    return -1
  }

  return 0
}
