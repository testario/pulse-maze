import { onBeforeUnmount } from 'vue'

import { MAX_FRAME_DELTA_TIME } from '../game/config'

/** Запускает игровой цикл с ограничением длины кадра. */
export function useGameLoop(onFrame: (deltaTime: number) => void) {
  let animationFrameId: number | null = null
  let previousTimestamp: number | null = null

  function runFrame(timestamp: number) {
    if (previousTimestamp === null) {
      previousTimestamp = timestamp
    }

    const deltaTime = Math.min((timestamp - previousTimestamp) / 1000, MAX_FRAME_DELTA_TIME)
    previousTimestamp = timestamp

    onFrame(deltaTime)
    animationFrameId = window.requestAnimationFrame(runFrame)
  }

  function startGameLoop() {
    if (animationFrameId !== null) {
      return
    }

    previousTimestamp = null
    animationFrameId = window.requestAnimationFrame(runFrame)
  }

  function stopGameLoop() {
    if (animationFrameId === null) {
      return
    }

    window.cancelAnimationFrame(animationFrameId)
    animationFrameId = null
    previousTimestamp = null
  }

  onBeforeUnmount(stopGameLoop)

  return {
    startGameLoop,
    stopGameLoop,
  }
}
