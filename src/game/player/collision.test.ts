import { describe, expect, it } from 'vitest'

import {
  MAZE_CENTER_RADIUS,
  MAZE_RING_WIDTH,
  PLAYER_RADIUS,
  PLAYER_WALL_CLEARANCE,
  SECTOR_ANGLE,
} from '../config'
import { createStaticMaze } from '../maze/staticMaze'
import { resolveAngularCollision, resolveRadialCollision } from './collision'
import { updatePlayer } from './updatePlayer'

const PLAYER_COLLISION_RADIUS = PLAYER_RADIUS + PLAYER_WALL_CLEARANCE

describe('collision', () => {
  it('не выпускает игрока из центра через закрытую круговую стену', () => {
    const maze = createStaticMaze()
    const playerPosition = { radius: MAZE_CENTER_RADIUS - 18, angle: SECTOR_ANGLE * 1.5 }

    const radius = resolveRadialCollision(maze, playerPosition, MAZE_CENTER_RADIUS + 12)

    expect(radius).toBe(MAZE_CENTER_RADIUS - PLAYER_COLLISION_RADIUS)
  })

  it('позволяет выйти из центра только через открытый сектор', () => {
    const maze = createStaticMaze()
    const playerPosition = { radius: MAZE_CENTER_RADIUS - 18, angle: SECTOR_ANGLE / 2 }

    const radius = resolveRadialCollision(maze, playerPosition, MAZE_CENTER_RADIUS + 12)

    expect(radius).toBe(MAZE_CENTER_RADIUS + 12)
  })

  it('останавливает игрока перед закрытой стеной между кольцами', () => {
    const maze = createStaticMaze()
    const playerPosition = {
      radius: MAZE_CENTER_RADIUS + MAZE_RING_WIDTH / 2,
      angle: SECTOR_ANGLE * 2.5,
    }

    const radius = resolveRadialCollision(
      maze,
      playerPosition,
      MAZE_CENTER_RADIUS + MAZE_RING_WIDTH + 20,
    )

    expect(radius).toBe(MAZE_CENTER_RADIUS + MAZE_RING_WIDTH - PLAYER_COLLISION_RADIUS)
  })

  it('останавливает игрока перед радиальной стеной', () => {
    const maze = createStaticMaze()
    const playerPosition = {
      radius: MAZE_CENTER_RADIUS + MAZE_RING_WIDTH / 2,
      angle: SECTOR_ANGLE / 2,
    }
    const expectedAngle = Math.asin(PLAYER_COLLISION_RADIUS / playerPosition.radius)

    const angle = resolveAngularCollision(maze, playerPosition, -SECTOR_ANGLE / 2)

    expect(angle).toBeCloseTo(expectedAngle)
  })

  it('отдаёт приоритет угловому движению, когда переданы оба направления', () => {
    const maze = createStaticMaze()
    const playerPosition = {
      radius: MAZE_CENTER_RADIUS + MAZE_RING_WIDTH / 2,
      angle: SECTOR_ANGLE * 2.5,
    }

    const updatedPosition = updatePlayer(
      playerPosition,
      maze,
      { angularDirection: 1, radialFactor: 1 },
      0.1,
    )

    expect(updatedPosition.radius).toBe(playerPosition.radius)
    expect(updatedPosition.angle).not.toBe(playerPosition.angle)
  })
})
