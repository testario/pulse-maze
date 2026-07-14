import { ANGULAR_SPEED, RADIAL_SPEED } from '../config'
import type { PolarMaze } from '../maze/mazeTypes'
import type { AngularDirection, PolarPosition, RadialDirection } from '../types'
import { resolveAngularCollision, resolveRadialCollision } from './collision'

export interface PlayerInput {
  angularDirection: AngularDirection
  radialDirection: RadialDirection
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

  if (input.radialDirection !== 0) {
    const targetRadius = playerPosition.radius + input.radialDirection * RADIAL_SPEED * safeDeltaTime

    return {
      ...playerPosition,
      radius: resolveRadialCollision(maze, playerPosition, targetRadius),
    }
  }

  return { ...playerPosition }
}
