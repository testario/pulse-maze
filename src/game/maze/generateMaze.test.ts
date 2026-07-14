import { describe, expect, it } from 'vitest'

import {
  MAZE_RING_COUNT,
  MAZE_SECTOR_COUNT,
  MIN_SOLUTION_BRANCHES,
  MIN_SOLUTION_PATH_CELLS,
} from '../config'
import { generateMaze } from './generateMaze'
import { getMazeNeighbor } from './mazeNeighbors'
import { MAZE_WALLS, OPPOSITE_MAZE_WALL } from './mazeWalls'
import type { PolarMaze } from './mazeTypes'
import { countPathBranches, hasInwardStep, validateMaze } from './validateMaze'

describe('generateMaze', () => {
  it('создаёт 1000 длинных путей с inward-переходом и боковыми ветвями', () => {
    const random = createSeededRandom(20260714)
    const centerExitSectors = new Set<number>()
    const exitSectors = new Set<number>()

    for (let generation = 0; generation < 1000; generation += 1) {
      const maze = generateMaze(random)
      const validation = validateMaze(maze)

      centerExitSectors.add(maze.centerExitSector)
      exitSectors.add(maze.exitSector)

      expect(maze.cells).toHaveLength(MAZE_RING_COUNT)
      expect(maze.cells.every((ring) => ring.length === MAZE_SECTOR_COUNT)).toBe(true)
      expect(validation.isValid).toBe(true)
      expect(validation.pathToExit[0]).toEqual({ ring: 0, sector: maze.centerExitSector })
      expect(validation.pathToExit[validation.pathToExit.length - 1]).toEqual({
        ring: MAZE_RING_COUNT - 1,
        sector: maze.exitSector,
      })
      expect(validation.pathToExit.length).toBeGreaterThanOrEqual(MIN_SOLUTION_PATH_CELLS)
      expect(hasInwardStep(validation.pathToExit)).toBe(true)
      expect(countPathBranches(maze, validation.pathToExit)).toBeGreaterThanOrEqual(
        MIN_SOLUTION_BRANCHES,
      )
      expect(countOpenCenterPassages(maze)).toBe(1)
      expect(countOpenOuterPassages(maze)).toBe(1)
      expectWallsAreConsistent(maze)
    }

    expect(centerExitSectors.size).toBeGreaterThan(1)
    expect(exitSectors.size).toBeGreaterThan(1)
  })
})

function countOpenCenterPassages(maze: PolarMaze): number {
  return maze.cells[0].filter((cell) => !cell.walls.inner).length
}

function countOpenOuterPassages(maze: PolarMaze): number {
  return maze.cells[MAZE_RING_COUNT - 1].filter((cell) => !cell.walls.outer).length
}

function expectWallsAreConsistent(maze: PolarMaze) {
  for (let ring = 0; ring < MAZE_RING_COUNT; ring += 1) {
    for (let sector = 0; sector < MAZE_SECTOR_COUNT; sector += 1) {
      const coordinate = { ring, sector }
      const cell = maze.cells[ring][sector]

      for (const wall of MAZE_WALLS) {
        const neighbor = getMazeNeighbor(coordinate, wall)

        if (!neighbor) {
          continue
        }

        expect(cell.walls[wall]).toBe(
          maze.cells[neighbor.ring][neighbor.sector].walls[OPPOSITE_MAZE_WALL[wall]],
        )
      }
    }
  }
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0

    return state / 2 ** 32
  }
}
