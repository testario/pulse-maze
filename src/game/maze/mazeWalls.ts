import { MAZE_RING_COUNT, MAZE_SECTOR_COUNT } from '../config'
import { getMazeNeighbor } from './mazeNeighbors'
import type { MazeCell, MazeCellCoordinate, MazeWall, PolarMaze } from './mazeTypes'

export const MAZE_WALLS: MazeWall[] = ['inner', 'outer', 'clockwise', 'counterClockwise']

export const OPPOSITE_MAZE_WALL: Record<MazeWall, MazeWall> = {
  inner: 'outer',
  outer: 'inner',
  clockwise: 'counterClockwise',
  counterClockwise: 'clockwise',
}

/** Создаёт закрытую полярную сетку с указанными секторами входа и выхода. */
export function createClosedMaze(centerExitSector: number, exitSector: number): PolarMaze {
  return {
    cells: Array.from({ length: MAZE_RING_COUNT }, () =>
      Array.from({ length: MAZE_SECTOR_COUNT }, createClosedCell),
    ),
    centerExitSector,
    exitSector,
  }
}

/** Убирает стену у пары соседних ячеек или на внешней границе лабиринта. */
export function openMazePassage(
  maze: PolarMaze,
  coordinate: MazeCellCoordinate,
  wall: MazeWall,
) {
  maze.cells[coordinate.ring][coordinate.sector].walls[wall] = false

  const neighbor = getMazeNeighbor(coordinate, wall)

  if (!neighbor) {
    return
  }

  maze.cells[neighbor.ring][neighbor.sector].walls[OPPOSITE_MAZE_WALL[wall]] = false
}

function createClosedCell(): MazeCell {
  return {
    walls: {
      inner: true,
      outer: true,
      clockwise: true,
      counterClockwise: true,
    },
  }
}
