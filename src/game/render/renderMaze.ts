import {
  MAZE_CENTER_RADIUS,
  MAZE_RING_COUNT,
  MAZE_RING_WIDTH,
  MAZE_SECTOR_COUNT,
  MAZE_WALL_COLOR,
  MAZE_WALL_WIDTH,
  SECTOR_ANGLE,
} from '../config'
import type { PolarMaze } from '../maze/mazeTypes'

/** Рисует стены полярного лабиринта в Canvas-координатах. */
export function renderMaze(
  context: CanvasRenderingContext2D,
  maze: PolarMaze,
  center: number,
  scale: number,
) {
  context.strokeStyle = MAZE_WALL_COLOR
  context.lineWidth = MAZE_WALL_WIDTH

  for (let ring = 0; ring < MAZE_RING_COUNT; ring += 1) {
    const innerRadius = (MAZE_CENTER_RADIUS + ring * MAZE_RING_WIDTH) * scale
    const outerRadius = (MAZE_CENTER_RADIUS + (ring + 1) * MAZE_RING_WIDTH) * scale

    for (let sector = 0; sector < MAZE_SECTOR_COUNT; sector += 1) {
      const cell = maze.cells[ring][sector]
      const startAngle = sector * SECTOR_ANGLE
      const endAngle = startAngle + SECTOR_ANGLE

      if (cell.walls.inner) {
        drawArc(context, center, innerRadius, startAngle, endAngle)
      }

      if (cell.walls.counterClockwise) {
        drawRadialWall(context, center, innerRadius, outerRadius, startAngle)
      }

      if (ring === MAZE_RING_COUNT - 1 && cell.walls.outer) {
        drawArc(context, center, outerRadius, startAngle, endAngle)
      }
    }
  }
}

function drawArc(
  context: CanvasRenderingContext2D,
  center: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  context.beginPath()
  context.arc(center, center, radius, startAngle, endAngle)
  context.stroke()
}

function drawRadialWall(
  context: CanvasRenderingContext2D,
  center: number,
  innerRadius: number,
  outerRadius: number,
  angle: number,
) {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)

  context.beginPath()
  context.moveTo(center + innerRadius * cosine, center + innerRadius * sine)
  context.lineTo(center + outerRadius * cosine, center + outerRadius * sine)
  context.stroke()
}
