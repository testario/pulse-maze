import { MAZE_RING_COUNT, MAZE_SECTOR_COUNT } from '../config'
import { createClosedMaze, openMazePassage } from './mazeWalls'
import type { PolarMaze } from './mazeTypes'

/** Создаёт связный тестовый лабиринт с единственным выходом из центра. */
export function createStaticMaze(): PolarMaze {
  const maze = createClosedMaze(0, MAZE_SECTOR_COUNT - 1)

  openMazePassage(maze, { ring: 0, sector: 0 }, 'inner')

  for (let ring = 0; ring < MAZE_RING_COUNT; ring += 1) {
    const isClockwisePath = ring % 2 === 0
    openRingPath(maze, ring, isClockwisePath)

    if (ring === MAZE_RING_COUNT - 1) {
      continue
    }

    const sector = isClockwisePath ? MAZE_SECTOR_COUNT - 1 : 0
    openMazePassage(maze, { ring, sector }, 'outer')
  }

  openMazePassage(maze, { ring: MAZE_RING_COUNT - 1, sector: maze.exitSector }, 'outer')

  return maze
}

export const STATIC_MAZE = createStaticMaze()

function openRingPath(maze: PolarMaze, ring: number, isClockwisePath: boolean) {
  if (isClockwisePath) {
    for (let sector = 0; sector < MAZE_SECTOR_COUNT - 1; sector += 1) {
      openMazePassage(maze, { ring, sector }, 'clockwise')
    }

    return
  }

  for (let sector = MAZE_SECTOR_COUNT - 1; sector > 0; sector -= 1) {
    openMazePassage(maze, { ring, sector }, 'counterClockwise')
  }
}
