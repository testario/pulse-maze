import { describe, expect, it } from 'vitest'

import { MAZE_OUTER_RADIUS, PLAYER_RADIUS, SECTOR_ANGLE } from '../config'
import { createStaticMaze } from '../maze/staticMaze'
import { hasPlayerWon } from './win'

describe('hasPlayerWon', () => {
  it('завершает игру после полного выхода через открытый внешний сектор', () => {
    const maze = createStaticMaze()
    const angle = maze.exitSector * SECTOR_ANGLE + SECTOR_ANGLE / 2

    expect(hasPlayerWon(maze, {
      radius: MAZE_OUTER_RADIUS + PLAYER_RADIUS,
      angle,
    })).toBe(true)
  })

  it('не завершает игру в другом секторе или до полного выхода', () => {
    const maze = createStaticMaze()

    expect(hasPlayerWon(maze, {
      radius: MAZE_OUTER_RADIUS + PLAYER_RADIUS - 0.1,
      angle: maze.exitSector * SECTOR_ANGLE + SECTOR_ANGLE / 2,
    })).toBe(false)
    expect(hasPlayerWon(maze, {
      radius: MAZE_OUTER_RADIUS + PLAYER_RADIUS,
      angle: 0,
    })).toBe(false)
  })
})
