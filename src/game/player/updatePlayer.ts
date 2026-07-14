import {
  ANGULAR_SPEED,
  HEART_RATE_RADIAL_SPEED,
  RADIAL_FACTOR_MAX,
  RADIAL_FACTOR_MIN,
} from '../config'
import type { PolarMaze } from '../maze/mazeTypes'
import type { AngularDirection, PolarPosition } from '../types'
import { resolveAngularCollision, resolveRadialCollision } from './collision'
import { clamp } from '../../utils/clamp'

export interface PlayerInput {
  angularDirection: AngularDirection
  radialFactor: number
}

/** Обновляет игрока по одной оси и не допускает диагонального движения. */
export function updatePlayer(
  playerPosition: PolarPosition,
  maze: PolarMaze,
  input: PlayerInput,
  deltaTime: number,
): PolarPosition {
  const safeDeltaTime = Math.max(deltaTime, 0)

  if (input.angularDirection !== 0) {
    const targetAngle = playerPosition.angle + input.angularDirection * ANGULAR_SPEED * safeDeltaTime

    return {
      ...playerPosition,
      angle: resolveAngularCollision(maze, playerPosition, targetAngle),
    }
  }

  const radialFactor = clamp(input.radialFactor, RADIAL_FACTOR_MIN, RADIAL_FACTOR_MAX)

  if (radialFactor !== 0) {
    const targetRadius = playerPosition.radius + radialFactor * HEART_RATE_RADIAL_SPEED * safeDeltaTime

    return {
      ...playerPosition,
      radius: resolveRadialCollision(maze, playerPosition, targetRadius),
    }
  }

  return { ...playerPosition }
}
