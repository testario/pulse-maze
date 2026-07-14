/** Набор стен одной ячейки полярного лабиринта. */
export interface MazeWalls {
  inner: boolean
  outer: boolean
  clockwise: boolean
  counterClockwise: boolean
}

export interface MazeCell {
  walls: MazeWalls
}

export interface MazeCellCoordinate {
  ring: number
  sector: number
}

export type MazeWall = keyof MazeWalls

/** Полярная сетка и проходы через её центр и внешний край. */
export interface PolarMaze {
  cells: MazeCell[][]
  centerExitSector: number
  exitSector: number
}
