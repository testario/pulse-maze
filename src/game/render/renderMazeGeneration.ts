import {
  GAME_BACKGROUND_COLOR,
  MAZE_CENTER_RADIUS,
  MAZE_OUTER_RADIUS,
  MAZE_RENDER_PADDING,
  MAZE_RING_WIDTH,
  PLAYER_COLOR,
  SECTOR_ANGLE,
} from '../config'
import type { MazeCellCoordinate, PolarMaze } from '../maze/mazeTypes'
import { renderMaze } from './renderMaze'

const VISITED_CELL_COLOR = '#e9e9e4'

/** Рисует состояние пошаговой генерации лабиринта. */
export function renderMazeGeneration(
  context: CanvasRenderingContext2D,
  canvasSize: number,
  maze: PolarMaze,
  visitedCells: MazeCellCoordinate[],
  activeCell: MazeCellCoordinate | null,
) {
  context.fillStyle = GAME_BACKGROUND_COLOR
  context.fillRect(0, 0, canvasSize, canvasSize)

  const center = canvasSize / 2
  const scale = Math.max(0, center - MAZE_RENDER_PADDING) / MAZE_OUTER_RADIUS

  context.fillStyle = VISITED_CELL_COLOR

  for (const cell of visitedCells) {
    fillCell(context, cell, center, scale)
  }

  renderMaze(context, maze, center, scale)

  if (activeCell) {
    renderActiveCell(context, activeCell, center, scale)
  }
}

function fillCell(
  context: CanvasRenderingContext2D,
  cell: MazeCellCoordinate,
  center: number,
  scale: number,
) {
  const innerRadius = (MAZE_CENTER_RADIUS + cell.ring * MAZE_RING_WIDTH) * scale
  const outerRadius = (MAZE_CENTER_RADIUS + (cell.ring + 1) * MAZE_RING_WIDTH) * scale
  const startAngle = cell.sector * SECTOR_ANGLE
  const endAngle = startAngle + SECTOR_ANGLE

  context.beginPath()
  context.arc(center, center, outerRadius, startAngle, endAngle)
  context.arc(center, center, innerRadius, endAngle, startAngle, true)
  context.closePath()
  context.fill()
}

function renderActiveCell(
  context: CanvasRenderingContext2D,
  cell: MazeCellCoordinate,
  center: number,
  scale: number,
) {
  const radius = (MAZE_CENTER_RADIUS + (cell.ring + 0.5) * MAZE_RING_WIDTH) * scale
  const angle = cell.sector * SECTOR_ANGLE + SECTOR_ANGLE / 2
  const markerRadius = Math.max(3, 5 * scale)

  context.fillStyle = PLAYER_COLOR
  context.beginPath()
  context.arc(
    center + Math.cos(angle) * radius,
    center + Math.sin(angle) * radius,
    markerRadius,
    0,
    Math.PI * 2,
  )
  context.fill()
}
