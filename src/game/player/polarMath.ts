import { FULL_CIRCLE_ANGLE } from '../config'
import type { PolarPosition } from '../types'

/** Нормализует угол в диапазон от 0 до 2π, не включая 2π. */
export function normalizeAngle(angle: number): number {
  const normalizedAngle = angle % FULL_CIRCLE_ANGLE

  if (normalizedAngle === 0) {
    return 0
  }

  return normalizedAngle < 0 ? normalizedAngle + FULL_CIRCLE_ANGLE : normalizedAngle
}

/** Переводит полярные координаты игрока в координаты Canvas. */
export function getCanvasPoint(
  playerPosition: PolarPosition,
  centerX: number,
  centerY: number,
  scale = 1,
) {
  return {
    x: centerX + playerPosition.radius * scale * Math.cos(playerPosition.angle),
    y: centerY + playerPosition.radius * scale * Math.sin(playerPosition.angle),
  }
}
