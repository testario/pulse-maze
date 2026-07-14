import { computed, ref } from 'vue'

import { formatGameTime } from '../utils/formatTime'

/** Управляет игровым временем на основе performance.now(). */
export function useGameTimer() {
  const elapsedMs = ref(0)
  const formattedTime = computed(() => formatGameTime(elapsedMs.value))

  let startedAt: number | null = null
  let timerId: number | null = null

  function startTimer() {
    if (startedAt !== null) {
      return
    }

    startedAt = performance.now()
    timerId = window.setInterval(updateElapsedTime, 250)
  }

  function pauseTimer() {
    if (startedAt === null) {
      return
    }

    updateElapsedTime()
    startedAt = null

    if (timerId !== null) {
      window.clearInterval(timerId)
      timerId = null
    }
  }

  function resetTimer() {
    pauseTimer()
    elapsedMs.value = 0
  }

  function updateElapsedTime() {
    if (startedAt === null) {
      return
    }

    const now = performance.now()

    elapsedMs.value += now - startedAt
    startedAt = now
  }

  return {
    elapsedMs,
    formattedTime,
    pauseTimer,
    resetTimer,
    startTimer,
  }
}
