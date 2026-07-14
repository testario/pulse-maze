import { FULL_CIRCLE_ANGLE } from '../config'
import type { AngularDirection, PolarPosition } from '../types'

/** Нормализует угол в диапазон от 0 до 2π, не включая 2π. */
export function normalizeAngle(angle: number): number {
  const normalizedAngle = angle % FULL_CIRCLE_ANGLE

  if (normalizedAngle === 0) {
    return 0
  }

  return normalizedAngle < 0 ? normalizedAngle + FULL_CIRCLE_ANGLE : normalizedAngle
}

/** Изменяет только угол игрока, сохраняя его радиус. */
export function movePlayerAlongArc(
  playerPosition: PolarPosition,
  direction: AngularDirection,
  angularSpeed: number,
  deltaTime: number,
) {
  playerPosition.angle = normalizeAngle(
    playerPosition.angle + direction * angularSpeed * deltaTime,
  )
}

/** Переводит полярные координаты игрока в координаты Canvas. */
export function getCanvasPoint(
  playerPosition: PolarPosition,
  centerX: number,
  centerY: number,
) {
  return {
    x: centerX + playerPosition.radius * Math.cos(playerPosition.angle),
    y: centerY + playerPosition.radius * Math.sin(playerPosition.angle),
  }
}
