import { MAX_VALID_BPM, MIN_VALID_BPM } from './config'
import { getMedian } from '../utils/median'

/** Оставляет только пригодные для калибровки значения пульса. */
export function filterCalibrationBpm(values: number[]): number[] {
  return values.filter((value) => (
    Number.isFinite(value) && value >= MIN_VALID_BPM && value <= MAX_VALID_BPM
  ))
}

/** Рассчитывает resting BPM как медиану валидных значений калибровки. */
export function getRestingBpm(values: number[]): number | null {
  return getMedian(filterCalibrationBpm(values))
}
