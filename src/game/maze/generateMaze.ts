import {
  MAZE_RING_COUNT,
  MAZE_SECTOR_COUNT,
  MAX_MAZE_GENERATION_ATTEMPTS,
  MIN_SOLUTION_BRANCHES,
  MIN_SOLUTION_PATH_CELLS,
} from '../config'
import { getMazeNeighbor, getWallToNeighbor } from './mazeNeighbors'
import { createClosedMaze, MAZE_WALLS, openMazePassage } from './mazeWalls'
import type { MazeCellCoordinate, MazeWall, PolarMaze } from './mazeTypes'
import { countPathBranches, findPathFromCenter, hasInwardStep, validateMaze } from './validateMaze'

type RandomSource = () => number

export type MazeGenerationStep = MazePassageGenerationStep | MazeBacktrackGenerationStep

export interface MazeGenerationResult {
  maze: PolarMaze
  steps: MazeGenerationStep[]
}

interface MazePassageGenerationStep {
  type: 'start' | 'carve' | 'exit'
  coordinate: MazeCellCoordinate
  wall: MazeWall
  activeCell: MazeCellCoordinate
}

interface MazeBacktrackGenerationStep {
  type: 'backtrack'
  activeCell: MazeCellCoordinate
}

/** Генерирует связный полярный лабиринт randomized DFS с обязательным движением к центру. */
export function generateMaze(random: RandomSource = Math.random): PolarMaze {
  return generateMazeWithSteps(random).maze
}

/** Генерирует лабиринт и возвращает шаги, из которых состоит его построение. */
export function generateMazeWithSteps(random: RandomSource = Math.random): MazeGenerationResult {
  for (let attempt = 0; attempt < MAX_MAZE_GENERATION_ATTEMPTS; attempt += 1) {
    const generation = createMaze(random)

    if (!generation) {
      continue
    }

    const validation = validateMaze(generation.maze)

    if (
      validation.isValid &&
      validation.pathToExit.length >= MIN_SOLUTION_PATH_CELLS &&
      hasInwardStep(validation.pathToExit) &&
      countPathBranches(generation.maze, validation.pathToExit) >= MIN_SOLUTION_BRANCHES
    ) {
      return generation
    }
  }

  throw new Error('Не удалось создать корректный лабиринт.')
}

function createMaze(random: RandomSource): MazeGenerationResult | null {
  const centerExitSector = getRandomSector(random)
  const maze = createClosedMaze(centerExitSector, 0)
  const start = { ring: 0, sector: centerExitSector }
  const steps: MazeGenerationStep[] = []

  openMazePassage(maze, start, 'inner')
  steps.push({
    type: 'start',
    coordinate: start,
    wall: 'inner',
    activeCell: start,
  })
  carveDepthFirstTree(maze, start, random, steps)

  const exitCandidates = getExitCandidates(maze)

  if (exitCandidates.length === 0) {
    return null
  }

  const exit = exitCandidates[getRandomIndex(random, exitCandidates.length)]
  maze.exitSector = exit.sector
  openMazePassage(maze, { ring: MAZE_RING_COUNT - 1, sector: exit.sector }, 'outer')
  steps.push({
    type: 'exit',
    coordinate: exit,
    wall: 'outer',
    activeCell: exit,
  })

  return { maze, steps }
}

function carveDepthFirstTree(
  maze: PolarMaze,
  start: MazeCellCoordinate,
  random: RandomSource,
  steps: MazeGenerationStep[],
) {
  const visitedCells = new Set([getCellId(start)])
  const stack = [start]

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const unvisitedNeighbors = getUnvisitedNeighbors(current, visitedCells)

    if (unvisitedNeighbors.length === 0) {
      stack.pop()
      const previous = stack[stack.length - 1]

      if (previous) {
        steps.push({ type: 'backtrack', activeCell: previous })
      }

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
    steps.push({
      type: 'carve',
      coordinate: current,
      wall,
      activeCell: next,
    })
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
