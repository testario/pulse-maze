import {
  ANGULAR_SPEED,
  HEART_RATE_RADIAL_SPEED,
  MAX_PLAYER_COLLISION_STEP_TIME,
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

/** Обновляет игрока по углу и радиусу с проверкой коллизий на каждом шаге. */
export function updatePlayer(
  playerPosition: PolarPosition,
  maze: PolarMaze,
  input: PlayerInput,
  deltaTime: number,
): PolarPosition {
  const safeDeltaTime = Math.max(deltaTime, 0)
  const angularDirection = Number.isFinite(input.angularDirection)
    ? clamp(input.angularDirection, -1, 1)
    : 0
  const radialFactor = Number.isFinite(input.radialFactor)
    ? clamp(input.radialFactor, RADIAL_FACTOR_MIN, RADIAL_FACTOR_MAX)
    : 0
  const stepCount = Math.max(1, Math.ceil(safeDeltaTime / MAX_PLAYER_COLLISION_STEP_TIME))
  const stepDeltaTime = safeDeltaTime / stepCount
  let nextPosition = { ...playerPosition }

  for (let step = 0; step < stepCount; step += 1) {
    nextPosition = updatePlayerStep(
      nextPosition,
      maze,
      angularDirection,
      radialFactor,
      stepDeltaTime,
    )
  }

  return nextPosition
}

function updatePlayerStep(
  playerPosition: PolarPosition,
  maze: PolarMaze,
  angularDirection: number,
  radialFactor: number,
  deltaTime: number,
): PolarPosition {
  let nextPosition = { ...playerPosition }

  if (angularDirection !== 0) {
    const targetAngle = nextPosition.angle + angularDirection * ANGULAR_SPEED * deltaTime
    nextPosition = {
      ...nextPosition,
      angle: resolveAngularCollision(maze, nextPosition, targetAngle),
    }
  }

  if (radialFactor !== 0) {
    const targetRadius = nextPosition.radius + radialFactor * HEART_RATE_RADIAL_SPEED * deltaTime
    nextPosition = {
      ...nextPosition,
      radius: resolveRadialCollision(maze, nextPosition, targetRadius),
    }
  }

  return nextPosition
}
