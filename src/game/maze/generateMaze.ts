import {
  MAZE_RING_COUNT,
  MAZE_SECTOR_COUNT,
  MAX_MAZE_GENERATION_ATTEMPTS,
  MIN_SOLUTION_BRANCHES,
  MIN_SOLUTION_PATH_CELLS,
} from '../config'
import { getMazeNeighbor, getWallToNeighbor } from './mazeNeighbors'
import { createClosedMaze, MAZE_WALLS, openMazePassage } from './mazeWalls'
import type { MazeCellCoordinate, PolarMaze } from './mazeTypes'
import { countPathBranches, findPathFromCenter, hasInwardStep, validateMaze } from './validateMaze'

type RandomSource = () => number

/** Генерирует связный полярный лабиринт randomized DFS с обязательным движением к центру. */
export function generateMaze(random: RandomSource = Math.random): PolarMaze {
  for (let attempt = 0; attempt < MAX_MAZE_GENERATION_ATTEMPTS; attempt += 1) {
    const maze = createMaze(random)

    if (!maze) {
      continue
    }

    const validation = validateMaze(maze)

    if (
      validation.isValid &&
      validation.pathToExit.length >= MIN_SOLUTION_PATH_CELLS &&
      hasInwardStep(validation.pathToExit) &&
      countPathBranches(maze, validation.pathToExit) >= MIN_SOLUTION_BRANCHES
    ) {
      return maze
    }
  }

  throw new Error('Не удалось создать корректный лабиринт.')
}

function createMaze(random: RandomSource): PolarMaze | null {
  const centerExitSector = getRandomSector(random)
  const maze = createClosedMaze(centerExitSector, 0)
  const start = { ring: 0, sector: centerExitSector }

  openMazePassage(maze, start, 'inner')
  carveDepthFirstTree(maze, start, random)

  const exitCandidates = getExitCandidates(maze)

  if (exitCandidates.length === 0) {
    return null
  }

  const exit = exitCandidates[getRandomIndex(random, exitCandidates.length)]
  maze.exitSector = exit.sector
  openMazePassage(maze, { ring: MAZE_RING_COUNT - 1, sector: exit.sector }, 'outer')

  return maze
}

function carveDepthFirstTree(
  maze: PolarMaze,
  start: MazeCellCoordinate,
  random: RandomSource,
) {
  const visitedCells = new Set([getCellId(start)])
  const stack = [start]

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const unvisitedNeighbors = getUnvisitedNeighbors(current, visitedCells)

    if (unvisitedNeighbors.length === 0) {
      stack.pop()
      continue
    }

    const next = unvisitedNeighbors[getRandomIndex(random, unvisitedNeighbors.length)]
    const wall = getWallToNeighbor(current, next)

    if (!wall) {
      throw new Error('DFS получил несоседнюю ячейку.')
    }

    openMazePassage(maze, current, wall)
    visitedCells.add(getCellId(next))
    stack.push(next)
  }
}

function getExitCandidates(maze: PolarMaze): MazeCellCoordinate[] {
  const candidates: MazeCellCoordinate[] = []

  for (let sector = 0; sector < MAZE_SECTOR_COUNT; sector += 1) {
    const exit = { ring: MAZE_RING_COUNT - 1, sector }
    const path = findPathFromCenter(maze, exit)

    if (
      path.length >= MIN_SOLUTION_PATH_CELLS &&
      hasInwardStep(path) &&
      countPathBranches(maze, path) >= MIN_SOLUTION_BRANCHES
    ) {
      candidates.push(exit)
    }
  }

  return candidates
}

function getUnvisitedNeighbors(
  coordinate: MazeCellCoordinate,
  visitedCells: Set<string>,
): MazeCellCoordinate[] {
  const neighbors: MazeCellCoordinate[] = []

  for (const wall of MAZE_WALLS) {
    const neighbor = getMazeNeighbor(coordinate, wall)

    if (neighbor && !visitedCells.has(getCellId(neighbor))) {
      neighbors.push(neighbor)
    }
  }

  return neighbors
}

function getRandomSector(random: RandomSource): number {
  return getRandomIndex(random, MAZE_SECTOR_COUNT)
}

function getRandomIndex(random: RandomSource, length: number): number {
  const value = random()
  const normalizedValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.9999999999999999) : 0

  return Math.floor(normalizedValue * length)
}

function getCellId(coordinate: MazeCellCoordinate): string {
  return `${coordinate.ring}:${coordinate.sector}`
}
