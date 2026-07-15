import {
  MOTION_TILT_DEAD_ZONE_DEGREES,
  MOTION_TILT_FULL_SPEED_DEGREES,
} from '../config'
import type { AngularDirection } from '../types'
import { clamp } from '../../utils/clamp'

/** Преобразует двухосевой наклон телефона в движение по касательной к текущему кругу. */
export function getAngularDirectionFromTilt(
  tiltBetaDegrees: number | null,
  tiltGammaDegrees: number | null,
  playerAngle: number,
  deadZoneDegrees = MOTION_TILT_DEAD_ZONE_DEGREES,
  fullSpeedDegrees = MOTION_TILT_FULL_SPEED_DEGREES,
): AngularDirection {
  if (!Number.isFinite(playerAngle)) {
    return 0
  }

  const tangentTiltDegrees = getTangentTiltDegrees(tiltBetaDegrees, tiltGammaDegrees, playerAngle)
  return getMovementFactorFromTilt(tangentTiltDegrees, deadZoneDegrees, fullSpeedDegrees)
}

/** Преобразует двухосевой наклон телефона в движение по радиусу текущего круга. */
export function getRadialFactorFromTilt(
  tiltBetaDegrees: number | null,
  tiltGammaDegrees: number | null,
  playerAngle: number,
  deadZoneDegrees = MOTION_TILT_DEAD_ZONE_DEGREES,
  fullSpeedDegrees = MOTION_TILT_FULL_SPEED_DEGREES,
): number {
  if (!Number.isFinite(playerAngle)) {
    return 0
  }

  const radialTiltDegrees = getRadialTiltDegrees(tiltBetaDegrees, tiltGammaDegrees, playerAngle)
  return getMovementFactorFromTilt(radialTiltDegrees, deadZoneDegrees, fullSpeedDegrees)
}

function getMovementFactorFromTilt(
  tiltDegrees: number,
  deadZoneDegrees: number,
  fullSpeedDegrees: number,
) {
  const safeDeadZoneDegrees = Math.max(deadZoneDegrees, 0)
  const safeFullSpeedDegrees = Math.max(fullSpeedDegrees, safeDeadZoneDegrees + 1)
  const absoluteTiltDegrees = Math.abs(tiltDegrees)

  if (absoluteTiltDegrees <= safeDeadZoneDegrees) {
    return 0
  }

  const activeTiltRange = safeFullSpeedDegrees - safeDeadZoneDegrees
  const tiltProgress = (absoluteTiltDegrees - safeDeadZoneDegrees) / activeTiltRange
  const speedFactor = clamp(tiltProgress, 0, 1) ** 2

  return tiltDegrees < 0 ? -speedFactor : speedFactor
}

function getTangentTiltDegrees(
  tiltBetaDegrees: number | null,
  tiltGammaDegrees: number | null,
  playerAngle: number,
) {
  const tiltX = getSafeTiltDegrees(tiltGammaDegrees)
  const tiltY = getSafeTiltDegrees(tiltBetaDegrees)
  const tangentX = -Math.sin(playerAngle)
  const tangentY = Math.cos(playerAngle)

  return tiltX * tangentX + tiltY * tangentY
}

function getRadialTiltDegrees(
  tiltBetaDegrees: number | null,
  tiltGammaDegrees: number | null,
  playerAngle: number,
) {
  const tiltX = getSafeTiltDegrees(tiltGammaDegrees)
  const tiltY = getSafeTiltDegrees(tiltBetaDegrees)
  const radialX = Math.cos(playerAngle)
  const radialY = Math.sin(playerAngle)

  return tiltX * radialX + tiltY * radialY
}

function getSafeTiltDegrees(tiltDegrees: number | null) {
  return tiltDegrees === null || !Number.isFinite(tiltDegrees) ? 0 : tiltDegrees
}
