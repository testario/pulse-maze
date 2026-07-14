import { GAME_BACKGROUND_COLOR, MAZE_OUTER_RADIUS, MAZE_RENDER_PADDING } from '../config'
import type { PolarMaze } from '../maze/mazeTypes'
import type { PolarPosition } from '../types'
import { renderMaze } from './renderMaze'
import { renderPlayer } from './renderPlayer'

/** Очищает Canvas и рисует текущий лабиринт вместе с игроком. */
export function renderGame(
  context: CanvasRenderingContext2D,
  canvasSize: number,
  maze: PolarMaze,
  playerPosition: PolarPosition,
) {
  context.fillStyle = GAME_BACKGROUND_COLOR
  context.fillRect(0, 0, canvasSize, canvasSize)

  const center = canvasSize / 2
  const scale = Math.max(0, center - MAZE_RENDER_PADDING) / MAZE_OUTER_RADIUS

  renderMaze(context, maze, center, scale)
  renderPlayer(context, playerPosition, center, scale)
}
