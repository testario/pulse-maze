/** Положение игрока в полярных координатах. */
export interface PolarPosition {
  radius: number
  angle: number
}

/** Фактор углового движения: -1 влево, 1 вправо, дробные значения задают часть скорости. */
export type AngularDirection = number
