import { MAZE_RING_COUNT, MAZE_SECTOR_COUNT } from '../config'
import { getMazeNeighbor } from './mazeNeighbors'
import { MAZE_WALLS, OPPOSITE_MAZE_WALL } from './mazeWalls'
import type { MazeCellCoordinate, PolarMaze } from './mazeTypes'

export interface MazeValidationResult {
  isValid: boolean
  pathToExit: MazeCellCoordinate[]
}

/** Проверяет геометрию, связность и путь из центра к внешнему выходу. */
export function validateMaze(maze: PolarMaze): MazeValidationResult {
  if (!hasValidGridShape(maze) || !hasSingleBoundaryPassages(maze) || !hasConsistentWalls(maze)) {
    return { isValid: false, pathToExit: [] }
  }

  const traversal = traverseMaze(maze)
  const pathToExit = buildPathToCoordinate(
    { ring: MAZE_RING_COUNT - 1, sector: maze.exitSector },
    traversal.parents,
  )
  const cellCount = MAZE_RING_COUNT * MAZE_SECTOR_COUNT
  const isConnected = traversal.visited.size === cellCount
  const hasTreeStructure = countOpenInternalPassages(maze) === cellCount - 1

  return {
    isValid: isConnected && hasTreeStructure && pathToExit.length > 0,
    pathToExit,
  }
}

/** Возвращает true, если решение требует хотя бы одного движения к центру. */
export function hasInwardStep(path: MazeCellCoordinate[]): boolean {
  return path.some((coordinate, index) => {
    if (index === 0) {
      return false
    }

    return coordinate.ring < path[index - 1].ring
  })
}

/** Находит путь от входа из центра до указанной ячейки. */
export function findPathFromCenter(
  maze: PolarMaze,
  target: MazeCellCoordinate,
): MazeCellCoordinate[] {
  const traversal = traverseMaze(maze)

  return buildPathToCoordinate(target, traversal.parents)
}

/** Считает развилки пути, у которых есть соседняя ветвь вне решения. */
export function countPathBranches(maze: PolarMaze, path: MazeCellCoordinate[]): number {
  const pathCellIds = new Set(path.map(getCellId))

  return path.filter((coordinate) => {
    if (getCellDegree(maze, coordinate) < 3) {
      return false
    }

    return getOpenNeighbors(maze, coordinate).some((neighbor) => !pathCellIds.has(getCellId(neighbor)))
  }).length
}

function hasValidGridShape(maze: PolarMaze): boolean {
  if (
    maze.cells.length !== MAZE_RING_COUNT ||
    !isValidSector(maze.centerExitSector) ||
    !isValidSector(maze.exitSector)
  ) {
    return false
  }

  return maze.cells.every((ring) => ring.length === MAZE_SECTOR_COUNT)
}

function hasSingleBoundaryPassages(maze: PolarMaze): boolean {
  const centerOpenSectors = maze.cells[0]
    .map((cell, sector) => ({ isOpen: !cell.walls.inner, sector }))
    .filter(({ isOpen }) => isOpen)
  const outerRing = maze.cells[MAZE_RING_COUNT - 1]
  const exitOpenSectors = outerRing
    .map((cell, sector) => ({ isOpen: !cell.walls.outer, sector }))
    .filter(({ isOpen }) => isOpen)

  return (
    centerOpenSectors.length === 1 &&
    centerOpenSectors[0].sector === maze.centerExitSector &&
    exitOpenSectors.length === 1 &&
    exitOpenSectors[0].sector === maze.exitSector
  )
}

function hasConsistentWalls(maze: PolarMaze): boolean {
  for (let ring = 0; ring < MAZE_RING_COUNT; ring += 1) {
    for (let sector = 0; sector < MAZE_SECTOR_COUNT; sector += 1) {
      const coordinate = { ring, sector }
      const cell = maze.cells[ring][sector]

      for (const wall of MAZE_WALLS) {
        const neighbor = getMazeNeighbor(coordinate, wall)

        if (!neighbor) {
          continue
        }

        if (cell.walls[wall] !== maze.cells[neighbor.ring][neighbor.sector].walls[OPPOSITE_MAZE_WALL[wall]]) {
          return false
        }
      }
    }
  }

  return true
}

function traverseMaze(maze: PolarMaze) {
  const start = { ring: 0, sector: maze.centerExitSector }
  const pendingCells = [start]
  const visited = new Set<string>([getCellId(start)])
  const parents = new Map<string, string | null>([[getCellId(start), null]])

  for (let index = 0; index < pendingCells.length; index += 1) {
    const current = pendingCells[index]
    const cell = maze.cells[current.ring][current.sector]

    for (const wall of MAZE_WALLS) {
      if (cell.walls[wall]) {
        continue
      }

      const neighbor = getMazeNeighbor(current, wall)

      if (!neighbor) {
        continue
      }

      const neighborId = getCellId(neighbor)

      if (visited.has(neighborId)) {
        continue
      }

      visited.add(neighborId)
      parents.set(neighborId, getCellId(current))
      pendingCells.push(neighbor)
    }
  }

  return { parents, visited }
}

function buildPathToCoordinate(
  target: MazeCellCoordinate,
  parents: Map<string, string | null>,
): MazeCellCoordinate[] {
  const targetId = getCellId(target)

  if (!parents.has(targetId)) {
    return []
  }

  const path: MazeCellCoordinate[] = []
  let currentId: string | null = targetId

  while (currentId) {
    path.push(getCoordinateFromId(currentId))
    currentId = parents.get(currentId) ?? null
  }

  return path.reverse()
}

function getCellDegree(maze: PolarMaze, coordinate: MazeCellCoordinate): number {
  return getOpenNeighbors(maze, coordinate).length
}

function getOpenNeighbors(maze: PolarMaze, coordinate: MazeCellCoordinate): MazeCellCoordinate[] {
  const cell = maze.cells[coordinate.ring][coordinate.sector]
  const neighbors: MazeCellCoordinate[] = []

  for (const wall of MAZE_WALLS) {
    if (cell.walls[wall]) {
      continue
    }

    const neighbor = getMazeNeighbor(coordinate, wall)

    if (neighbor) {
      neighbors.push(neighbor)
    }
  }

  return neighbors
}

function countOpenInternalPassages(maze: PolarMaze): number {
  let passageCount = 0

  for (let ring = 0; ring < MAZE_RING_COUNT; ring += 1) {
    for (let sector = 0; sector < MAZE_SECTOR_COUNT; sector += 1) {
      const cell = maze.cells[ring][sector]

      if (ring < MAZE_RING_COUNT - 1 && !cell.walls.outer) {
        passageCount += 1
      }

      if (!cell.walls.clockwise) {
        passageCount += 1
      }
    }
  }

  return passageCount
}

function getCellId(coordinate: MazeCellCoordinate): string {
  return `${coordinate.ring}:${coordinate.sector}`
}

function getCoordinateFromId(cellId: string): MazeCellCoordinate {
  const [ring, sector] = cellId.split(':').map(Number)

  return { ring, sector }
}

function isValidSector(sector: number): boolean {
  return Number.isInteger(sector) && sector >= 0 && sector < MAZE_SECTOR_COUNT
}
