import { GAME_BACKGROUND_COLOR, PLAYER_COLOR, PLAYER_DOT_RADIUS } from '../config'
import { getCanvasPoint } from '../player/polarMath'
import type { PolarPosition } from '../types'

/** Очищает игровое поле и рисует игрока в его текущей позиции. */
export function renderGameFrame(
  context: CanvasRenderingContext2D,
  canvasSize: number,
  playerPosition: PolarPosition,
) {
  context.fillStyle = GAME_BACKGROUND_COLOR
  context.fillRect(0, 0, canvasSize, canvasSize)

  const center = canvasSize / 2
  const playerPoint = getCanvasPoint(playerPosition, center, center)

  context.beginPath()
  context.fillStyle = PLAYER_COLOR
  context.arc(playerPoint.x, playerPoint.y, PLAYER_DOT_RADIUS, 0, Math.PI * 2)
  context.fill()
}
