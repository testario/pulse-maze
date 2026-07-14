/** Положение игрока в полярных координатах. */
export interface PolarPosition {
  radius: number
  angle: number
}

export type AngularDirection = -1 | 0 | 1
export type RadialDirection = -1 | 0 | 1
