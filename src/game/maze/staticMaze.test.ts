import { describe, expect, it } from 'vitest'

import { MAZE_RING_COUNT, MAZE_SECTOR_COUNT } from '../config'
import { getMazeNeighbor } from './mazeNeighbors'
import type { MazeCellCoordinate, MazeWall, PolarMaze } from './mazeTypes'
import { createStaticMaze } from './staticMaze'

const MAZE_WALLS: MazeWall[] = ['inner', 'outer', 'clockwise', 'counterClockwise']

describe('createStaticMaze', () => {
  it('создаёт сетку из пяти колец по двенадцать секторов', () => {
    const maze = createStaticMaze()

    expect(maze.cells).toHaveLength(MAZE_RING_COUNT)
    expect(maze.cells.every((ring) => ring.length === MAZE_SECTOR_COUNT)).toBe(true)
  })

  it('оставляет единственный проход из центра', () => {
    const maze = createStaticMaze()
    const openSectors = maze.cells[0]
      .map((cell, sector) => ({ isOpen: !cell.walls.inner, sector }))
      .filter(({ isOpen }) => isOpen)

    expect(openSectors).toEqual([{ isOpen: true, sector: maze.centerExitSector }])
  })

  it('позволяет попасть в каждую ячейку из центра', () => {
    const maze = createStaticMaze()
    const reachableCells = getReachableCells(maze)

    expect(reachableCells).toHaveLength(MAZE_RING_COUNT * MAZE_SECTOR_COUNT)
  })
})

function getReachableCells(maze: PolarMaze): MazeCellCoordinate[] {
  const pendingCells: MazeCellCoordinate[] = [{ ring: 0, sector: maze.centerExitSector }]
  const visitedCells = new Set<string>()

  while (pendingCells.length > 0) {
    const currentCell = pendingCells.pop()

    if (!currentCell) {
      continue
    }

    const cellId = `${currentCell.ring}:${currentCell.sector}`

    if (visitedCells.has(cellId)) {
      continue
    }

    visitedCells.add(cellId)
    const cell = maze.cells[currentCell.ring][currentCell.sector]

    for (const wall of MAZE_WALLS) {
      if (cell.walls[wall]) {
        continue
      }

      const neighbor = getMazeNeighbor(currentCell, wall)

      if (neighbor) {
        pendingCells.push(neighbor)
      }
    }
  }

  return Array.from(visitedCells, (cellId) => {
    const [ring, sector] = cellId.split(':').map(Number)
    return { ring, sector }
  })
}
