import { MAZE_RING_COUNT, MAZE_SECTOR_COUNT } from '../config'
import { getMazeNeighbor } from './mazeNeighbors'
import type { MazeCell, MazeCellCoordinate, MazeWall, PolarMaze } from './mazeTypes'

const OPPOSITE_WALL: Record<MazeWall, MazeWall> = {
  inner: 'outer',
  outer: 'inner',
  clockwise: 'counterClockwise',
  counterClockwise: 'clockwise',
}

/** Создаёт связный тестовый лабиринт с единственным выходом из центра. */
export function createStaticMaze(): PolarMaze {
  const maze: PolarMaze = {
    cells: Array.from({ length: MAZE_RING_COUNT }, () =>
      Array.from({ length: MAZE_SECTOR_COUNT }, createClosedCell),
    ),
    centerExitSector: 0,
    exitSector: MAZE_SECTOR_COUNT - 1,
  }

  openPassage(maze, { ring: 0, sector: 0 }, 'inner')

  for (let ring = 0; ring < MAZE_RING_COUNT; ring += 1) {
    const isClockwisePath = ring % 2 === 0
    openRingPath(maze, ring, isClockwisePath)

    if (ring === MAZE_RING_COUNT - 1) {
      continue
    }

    const sector = isClockwisePath ? MAZE_SECTOR_COUNT - 1 : 0
    openPassage(maze, { ring, sector }, 'outer')
  }

  openPassage(maze, { ring: MAZE_RING_COUNT - 1, sector: maze.exitSector }, 'outer')

  return maze
}

export const STATIC_MAZE = createStaticMaze()

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

function openRingPath(maze: PolarMaze, ring: number, isClockwisePath: boolean) {
  if (isClockwisePath) {
    for (let sector = 0; sector < MAZE_SECTOR_COUNT - 1; sector += 1) {
      openPassage(maze, { ring, sector }, 'clockwise')
    }

    return
  }

  for (let sector = MAZE_SECTOR_COUNT - 1; sector > 0; sector -= 1) {
    openPassage(maze, { ring, sector }, 'counterClockwise')
  }
}

function openPassage(maze: PolarMaze, coordinate: MazeCellCoordinate, wall: MazeWall) {
  maze.cells[coordinate.ring][coordinate.sector].walls[wall] = false

  const neighbor = getMazeNeighbor(coordinate, wall)

  if (!neighbor) {
    return
  }

  maze.cells[neighbor.ring][neighbor.sector].walls[OPPOSITE_WALL[wall]] = false
}
