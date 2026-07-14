import { MAZE_RING_COUNT, MAZE_SECTOR_COUNT, SECTOR_ANGLE } from '../config'
import { normalizeAngle } from '../player/polarMath'
import type { MazeCellCoordinate, MazeWall } from './mazeTypes'

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

/** Определяет сектор, которому принадлежит угол. */
export function getSectorForAngle(angle: number): number {
  return Math.floor(normalizeAngle(angle) / SECTOR_ANGLE)
}

function normalizeSector(sector: number): number {
  return ((sector % MAZE_SECTOR_COUNT) + MAZE_SECTOR_COUNT) % MAZE_SECTOR_COUNT
}
