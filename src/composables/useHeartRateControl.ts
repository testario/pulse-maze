import { onBeforeUnmount, onMounted, ref } from 'vue'

import {
  DEBUG_HEART_RATE_STEP_BPM,
  HEART_RATE_BASELINE_BPM,
  MAX_VALID_BPM,
  MIN_VALID_BPM,
} from '../game/config'
import { smoothBpm } from '../game/heartRate'
import { clamp } from '../utils/clamp'

const DEBUG_HEART_RATE_QUERY_KEY = 'debugHeartRate'
const isDebugHeartRate = ref(isDebugHeartRateEnabled())
const rawBpm = ref(HEART_RATE_BASELINE_BPM)
const smoothedBpm = ref(HEART_RATE_BASELINE_BPM)
const lastMeasurementAt = ref<number | null>(isDebugHeartRate.value ? performance.now() : null)

/** Управляет виртуальным BPM, доступным только в debug-режиме. */
export function useHeartRateControl() {
  function updateRawBpm(nextBpm: number) {
    const nextRawBpm = clamp(nextBpm, MIN_VALID_BPM, MAX_VALID_BPM)

    rawBpm.value = nextRawBpm
    smoothedBpm.value = smoothBpm(smoothedBpm.value, nextRawBpm)
    lastMeasurementAt.value = performance.now()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!isDebugHeartRate.value) {
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      updateRawBpm(rawBpm.value + DEBUG_HEART_RATE_STEP_BPM)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      updateRawBpm(rawBpm.value - DEBUG_HEART_RATE_STEP_BPM)
    }
  }

  onMounted(() => {
    if (isDebugHeartRate.value) {
      window.addEventListener('keydown', handleKeyDown)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    isDebugHeartRate,
    lastMeasurementAt,
    rawBpm,
    smoothedBpm,
  }
}

/** Возвращает общее debug-состояние без подключения DOM-обработчиков. */
export function getDebugHeartRateState() {
  return {
    isDebugHeartRate,
    lastMeasurementAt,
    rawBpm,
    smoothedBpm,
  }
}

export function isDebugHeartRateEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return new URLSearchParams(window.location.search).get(DEBUG_HEART_RATE_QUERY_KEY) === 'true'
}
