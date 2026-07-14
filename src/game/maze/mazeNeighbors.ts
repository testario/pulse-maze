import { MAZE_RING_COUNT, MAZE_SECTOR_COUNT, SECTOR_ANGLE } from '../config'
import { normalizeAngle } from '../player/polarMath'
import type { MazeCellCoordinate, MazeWall } from './mazeTypes'

const NEIGHBOR_WALLS: MazeWall[] = ['inner', 'outer', 'clockwise', 'counterClockwise']

/** Возвращает сектор по часовой стрелке с переходом через нулевой сектор. */
export function getClockwiseSector(sector: number): number {
  return (normalizeSector(sector) + 1) % MAZE_SECTOR_COUNT
}

/** Возвращает сектор против часовой стрелки с переходом через последний сектор. */
export function getCounterClockwiseSector(sector: number): number {
  return (normalizeSector(sector) - 1 + MAZE_SECTOR_COUNT) % MAZE_SECTOR_COUNT
}

/** Находит соседнюю ячейку через заданную стену. */
export function getMazeNeighbor(
  coordinate: MazeCellCoordinate,
  wall: MazeWall,
): MazeCellCoordinate | null {
  switch (wall) {
    case 'inner':
      return coordinate.ring === 0
        ? null
        : { ring: coordinate.ring - 1, sector: coordinate.sector }
    case 'outer':
      return coordinate.ring === MAZE_RING_COUNT - 1
        ? null
        : { ring: coordinate.ring + 1, sector: coordinate.sector }
    case 'clockwise':
      return { ring: coordinate.ring, sector: getClockwiseSector(coordinate.sector) }
    case 'counterClockwise':
      return { ring: coordinate.ring, sector: getCounterClockwiseSector(coordinate.sector) }
  }
}

/** Находит стену, которая ведёт из одной соседней ячейки в другую. */
export function getWallToNeighbor(
  coordinate: MazeCellCoordinate,
  neighbor: MazeCellCoordinate,
): MazeWall | null {
  for (const wall of NEIGHBOR_WALLS) {
    const candidate = getMazeNeighbor(coordinate, wall)

    if (candidate?.ring === neighbor.ring && candidate.sector === neighbor.sector) {
      return wall
    }
  }

  return null
}

/** Определяет сектор, которому принадлежит угол. */
export function getSectorForAngle(angle: number): number {
  return Math.floor(normalizeAngle(angle) / SECTOR_ANGLE)
}

function normalizeSector(sector: number): number {
  return ((sector % MAZE_SECTOR_COUNT) + MAZE_SECTOR_COUNT) % MAZE_SECTOR_COUNT
}
