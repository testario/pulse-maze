import { MAZE_OUTER_RADIUS, MAZE_RING_COUNT, PLAYER_RADIUS } from '../config'
import { getSectorForAngle } from '../maze/mazeNeighbors'
import type { PolarMaze } from '../maze/mazeTypes'
import type { PolarPosition } from '../types'

/** Проверяет, прошёл ли игрок через открытый выход внешнего кольца. */
export function hasPlayerWon(maze: PolarMaze, playerPosition: PolarPosition): boolean {
  const exitCell = maze.cells[MAZE_RING_COUNT - 1][maze.exitSector]

  if (exitCell.walls.outer || getSectorForAngle(playerPosition.angle) !== maze.exitSector) {
    return false
  }

  return playerPosition.radius - PLAYER_RADIUS >= MAZE_OUTER_RADIUS
}
