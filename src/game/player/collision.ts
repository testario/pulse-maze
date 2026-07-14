import {
  FULL_CIRCLE_ANGLE,
  MAZE_CENTER_RADIUS,
  MAZE_OUTER_RADIUS,
  MAZE_RING_COUNT,
  MAZE_RING_WIDTH,
  PLAYER_RADIUS,
  PLAYER_WALL_CLEARANCE,
  SECTOR_ANGLE,
} from '../config'
import { getClockwiseSector, getCounterClockwiseSector, getSectorForAngle } from '../maze/mazeNeighbors'
import type { PolarMaze } from '../maze/mazeTypes'
import { normalizeAngle } from './polarMath'
import type { PolarPosition } from '../types'

const PLAYER_COLLISION_RADIUS = PLAYER_RADIUS + PLAYER_WALL_CLEARANCE

/** Возвращает кольцо, в котором находится точка игрока, или null для центра и внешней области. */
export function getRingForRadius(radius: number): number | null {
  if (radius < MAZE_CENTER_RADIUS || radius >= MAZE_OUTER_RADIUS) {
    return null
  }

  return Math.floor((radius - MAZE_CENTER_RADIUS) / MAZE_RING_WIDTH)
}

/** Ограничивает радиальный переход ближайшей круговой стеной. */
export function resolveRadialCollision(
  maze: PolarMaze,
  playerPosition: PolarPosition,
  targetRadius: number,
): number {
  const currentRadius = playerPosition.radius
  const boundedTargetRadius = Math.max(0, targetRadius)

  if (boundedTargetRadius === currentRadius) {
    return currentRadius
  }

  const sector = getSectorForAngle(playerPosition.angle)

  if (boundedTargetRadius > currentRadius) {
    return resolveOutwardCollision(maze, currentRadius, boundedTargetRadius, sector)
  }

  return resolveInwardCollision(maze, currentRadius, boundedTargetRadius, sector)
}

/** Ограничивает угловой переход ближайшей радиальной стеной. */
export function resolveAngularCollision(
  maze: PolarMaze,
  playerPosition: PolarPosition,
  targetAngle: number,
): number {
  const ring = getRingForRadius(playerPosition.radius)

  if (ring === null) {
    return normalizeAngle(targetAngle)
  }

  const currentAngle = normalizeAngle(playerPosition.angle)
  const angleDelta = targetAngle - playerPosition.angle

  if (angleDelta === 0) {
    return currentAngle
  }

  const angularClearance = Math.asin(
    Math.min(PLAYER_COLLISION_RADIUS / playerPosition.radius, 1),
  )

  return angleDelta > 0
    ? resolveClockwiseCollision(maze, ring, currentAngle, targetAngle, angularClearance)
    : resolveCounterClockwiseCollision(maze, ring, currentAngle, targetAngle, angularClearance)
}

function resolveOutwardCollision(
  maze: PolarMaze,
  currentRadius: number,
  targetRadius: number,
  sector: number,
): number {
  const currentEdge = currentRadius + PLAYER_COLLISION_RADIUS
  const targetEdge = targetRadius + PLAYER_COLLISION_RADIUS

  for (let boundaryIndex = 0; boundaryIndex <= MAZE_RING_COUNT; boundaryIndex += 1) {
    const boundaryRadius = getBoundaryRadius(boundaryIndex)

    if (currentEdge <= boundaryRadius && targetEdge > boundaryRadius && hasCircularWall(maze, boundaryIndex, sector)) {
      return boundaryRadius - PLAYER_COLLISION_RADIUS
    }
  }

  return targetRadius
}

function resolveInwardCollision(
  maze: PolarMaze,
  currentRadius: number,
  targetRadius: number,
  sector: number,
): number {
  const currentEdge = currentRadius - PLAYER_COLLISION_RADIUS
  const targetEdge = targetRadius - PLAYER_COLLISION_RADIUS

  for (let boundaryIndex = MAZE_RING_COUNT; boundaryIndex >= 0; boundaryIndex -= 1) {
    const boundaryRadius = getBoundaryRadius(boundaryIndex)

    if (currentEdge >= boundaryRadius && targetEdge < boundaryRadius && hasCircularWall(maze, boundaryIndex, sector)) {
      return boundaryRadius + PLAYER_COLLISION_RADIUS
    }
  }

  return targetRadius
}

function resolveClockwiseCollision(
  maze: PolarMaze,
  ring: number,
  currentAngle: number,
  targetAngle: number,
  angularClearance: number,
): number {
  let probeAngle = currentAngle
  const crossingCount = Math.ceil((targetAngle - currentAngle) / SECTOR_ANGLE) + 1

  for (let crossing = 0; crossing < crossingCount; crossing += 1) {
    const sector = getSectorForAngle(probeAngle)
    const boundaryAngle = (Math.floor(probeAngle / SECTOR_ANGLE) + 1) * SECTOR_ANGLE

    if (targetAngle < boundaryAngle) {
      return normalizeAngle(targetAngle)
    }

    if (hasRadialWall(maze, ring, sector, 'clockwise')) {
      return normalizeAngle(boundaryAngle - angularClearance)
    }

    probeAngle = boundaryAngle + Number.EPSILON
  }

  return normalizeAngle(targetAngle)
}

function resolveCounterClockwiseCollision(
  maze: PolarMaze,
  ring: number,
  currentAngle: number,
  targetAngle: number,
  angularClearance: number,
): number {
  let probeAngle = currentAngle
  const crossingCount = Math.ceil((currentAngle - targetAngle) / SECTOR_ANGLE) + 1

  for (let crossing = 0; crossing < crossingCount; crossing += 1) {
    const sector = getSectorForAngle(probeAngle)
    const boundaryAngle = Math.floor(probeAngle / SECTOR_ANGLE) * SECTOR_ANGLE

    if (targetAngle > boundaryAngle) {
      return normalizeAngle(targetAngle)
    }

    if (hasRadialWall(maze, ring, sector, 'counterClockwise')) {
      return normalizeAngle(boundaryAngle + angularClearance)
    }

    probeAngle = boundaryAngle - Number.EPSILON
  }

  return normalizeAngle(targetAngle)
}

function hasCircularWall(maze: PolarMaze, boundaryIndex: number, sector: number): boolean {
  if (boundaryIndex === 0) {
    return maze.cells[0][sector].walls.inner
  }

  if (boundaryIndex === MAZE_RING_COUNT) {
    return maze.cells[MAZE_RING_COUNT - 1][sector].walls.outer
  }

  return maze.cells[boundaryIndex - 1][sector].walls.outer || maze.cells[boundaryIndex][sector].walls.inner
}

function hasRadialWall(
  maze: PolarMaze,
  ring: number,
  sector: number,
  direction: 'clockwise' | 'counterClockwise',
): boolean {
  const cell = maze.cells[ring][sector]

  if (direction === 'clockwise') {
    const neighborSector = getClockwiseSector(sector)
    return cell.walls.clockwise || maze.cells[ring][neighborSector].walls.counterClockwise
  }

  const neighborSector = getCounterClockwiseSector(sector)
  return cell.walls.counterClockwise || maze.cells[ring][neighborSector].walls.clockwise
}

function getBoundaryRadius(boundaryIndex: number): number {
  return MAZE_CENTER_RADIUS + boundaryIndex * MAZE_RING_WIDTH
}
