import { describe, expect, it } from 'vitest'

import { MAZE_RING_COUNT } from '../config'
import {
  getClockwiseSector,
  getCounterClockwiseSector,
  getMazeNeighbor,
  getSectorForAngle,
} from './mazeNeighbors'

describe('mazeNeighbors', () => {
  it('переходит из последнего сектора в нулевой по часовой стрелке', () => {
    expect(getClockwiseSector(11)).toBe(0)
    expect(getMazeNeighbor({ ring: 2, sector: 11 }, 'clockwise')).toEqual({ ring: 2, sector: 0 })
  })

  it('переходит из нулевого сектора в последний против часовой стрелки', () => {
    expect(getCounterClockwiseSector(0)).toBe(11)
    expect(getMazeNeighbor({ ring: 2, sector: 0 }, 'counterClockwise')).toEqual({ ring: 2, sector: 11 })
  })

  it('не возвращает ячейку за центром или за внешним кольцом', () => {
    expect(getMazeNeighbor({ ring: 0, sector: 4 }, 'inner')).toBeNull()
    expect(getMazeNeighbor({ ring: MAZE_RING_COUNT - 1, sector: 4 }, 'outer')).toBeNull()
  })

  it('определяет сектор для нормализованного отрицательного угла', () => {
    expect(getSectorForAngle(-Math.PI / 12)).toBe(11)
  })
})
