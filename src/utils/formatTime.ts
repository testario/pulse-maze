/** Форматирует миллисекунды как MM:SS или HH:MM:SS. */
export function formatGameTime(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  if (hours > 0) {
    return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`
  }

  return `${padTime(totalMinutes)}:${padTime(seconds)}`
}

function padTime(value: number): string {
  return String(value).padStart(2, '0')
}
