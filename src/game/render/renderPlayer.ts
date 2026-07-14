import { PLAYER_COLOR, PLAYER_RADIUS } from '../config'
import { getCanvasPoint } from '../player/polarMath'
import type { PolarPosition } from '../types'

/** Рисует игрока в полярной позиции с учётом масштаба игрового поля. */
export function renderPlayer(
  context: CanvasRenderingContext2D,
  playerPosition: PolarPosition,
  center: number,
  scale: number,
) {
  const playerPoint = getCanvasPoint(playerPosition, center, center, scale)

  context.beginPath()
  context.fillStyle = PLAYER_COLOR
  context.arc(playerPoint.x, playerPoint.y, PLAYER_RADIUS * scale, 0, Math.PI * 2)
  context.fill()
}
