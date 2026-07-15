import { computed, ref, watch } from 'vue'

import {
  CALIBRATION_DURATION_MS,
  MAX_SESSION_DURATION_MS,
  PULSE_GRAPH_HISTORY_LENGTH,
  STALE_BPM_TIMEOUT_MS,
} from '../game/config'
import { getRestingBpm } from '../game/calibration'
import { getRadialFactor } from '../game/heartRate'
import { useBluetoothHeartRate } from './useBluetoothHeartRate'
import { getDebugHeartRateState } from './useHeartRateControl'
import { useGameTimer } from './useGameTimer'

export type GameState =
  | 'unsupported'
  | 'disconnected'
  | 'connecting'
  | 'calibrating'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'finished'

const bluetoothHeartRate = useBluetoothHeartRate()
const debugHeartRate = getDebugHeartRateState()
const gameState = ref<GameState>('disconnected')
const restingBpm = ref<number | null>(null)
const calibrationRemainingMs = ref(CALIBRATION_DURATION_MS)
const pauseMessage = ref<string | null>(null)
const finishMessage = ref<string | null>(null)
const hasShownSafetyWarning = ref(false)
const mazeVersion = ref(0)
const pulseHistory = ref<number[]>([])
const gameTimer = useGameTimer()

const currentRawBpm = computed(() => (
  debugHeartRate.isDebugHeartRate.value
    ? debugHeartRate.rawBpm.value
    : bluetoothHeartRate.rawBpm.value
))
const currentSmoothedBpm = computed(() => (
  debugHeartRate.isDebugHeartRate.value
    ? debugHeartRate.smoothedBpm.value
    : bluetoothHeartRate.smoothedBpm.value
))
const currentMeasurementAt = computed(() => (
  debugHeartRate.isDebugHeartRate.value
    ? debugHeartRate.lastMeasurementAt.value
    : bluetoothHeartRate.lastMeasurementAt.value
))
const radialFactor = computed(() => {
  if (restingBpm.value === null || currentSmoothedBpm.value === null) {
    return 0
  }

  return getRadialFactor(currentSmoothedBpm.value, restingBpm.value)
})

let calibrationStartedAt: number | null = null
let calibrationTimerId: number | null = null
let calibrationFinishId: number | null = null
let isLifecycleBound = false
let calibrationSamples: number[] = []

/** Предоставляет общую машину состояний игрового сеанса. */
export function useGameSession() {
  ensureLifecycleListeners()
  synchronizeConnectionState()

  return {
    calibrationRemainingMs,
    currentRawBpm,
    currentSmoothedBpm,
    finishGame,
    finishMessage,
    formattedTime: gameTimer.formattedTime,
    gameState,
    hasShownSafetyWarning,
    mazeVersion,
    pauseMessage,
    pulseHistory,
    radialFactor,
    restingBpm,
    resumeGame,
    startGame,
    startNewMaze,
  }
}

function synchronizeConnectionState() {
  if (debugHeartRate.isDebugHeartRate.value) {
    if (
      restingBpm.value === null &&
      gameState.value !== 'calibrating' &&
      gameState.value !== 'paused' &&
      gameState.value !== 'finished'
    ) {
      startCalibration()
    }

    return
  }

  switch (bluetoothHeartRate.connectionState.value) {
    case 'unsupported':
      setUnavailableState('unsupported', 'Web Bluetooth не поддерживается этим браузером.')
      return
    case 'disconnected':
      setUnavailableState('disconnected', 'Пульсометр отключён.')
      return
    case 'connecting':
      setUnavailableState('connecting', 'Подключение к пульсометру…')
      return
    case 'connected':
      if (currentRawBpm.value === null) {
        if (gameState.value !== 'paused' && gameState.value !== 'finished') {
          gameState.value = 'connecting'
        }

        return
      }

      if (
        restingBpm.value === null &&
        gameState.value !== 'calibrating' &&
        gameState.value !== 'paused' &&
        gameState.value !== 'finished'
      ) {
        startCalibration()
      }
  }
}

function setUnavailableState(state: Extract<GameState, 'unsupported' | 'disconnected' | 'connecting'>, message: string) {
  if (isActiveSessionState(gameState.value)) {
    pauseSession(message)
    return
  }

  if (gameState.value !== 'paused' && gameState.value !== 'finished') {
    gameState.value = state
  }
}

function startCalibration() {
  const bpm = currentRawBpm.value

  if (bpm === null) {
    return
  }

  clearCalibrationTimers()
  restingBpm.value = null
  calibrationSamples = [bpm]
  calibrationStartedAt = performance.now()
  calibrationRemainingMs.value = CALIBRATION_DURATION_MS
  pauseMessage.value = null
  gameState.value = 'calibrating'
  calibrationTimerId = window.setInterval(updateCalibrationProgress, 250)
  calibrationFinishId = window.setTimeout(finishCalibration, CALIBRATION_DURATION_MS)
}

function finishCalibration() {
  updateCalibrationProgress()

  if (gameState.value !== 'calibrating') {
    return
  }

  const nextRestingBpm = getRestingBpm(calibrationSamples)

  clearCalibrationTimers()

  if (nextRestingBpm === null) {
    gameState.value = 'paused'
    pauseMessage.value = 'Не удалось получить корректные данные пульса для калибровки.'
    return
  }

  restingBpm.value = nextRestingBpm
  calibrationRemainingMs.value = 0
  gameState.value = 'ready'
}

function recordCalibrationBpm() {
  if (gameState.value !== 'calibrating' || currentRawBpm.value === null) {
    return
  }

  calibrationSamples.push(currentRawBpm.value)
}

function updateCalibrationProgress() {
  if (calibrationStartedAt === null) {
    return
  }

  const elapsedMs = performance.now() - calibrationStartedAt

  calibrationRemainingMs.value = Math.max(CALIBRATION_DURATION_MS - elapsedMs, 0)
}

function startGame() {
  if (gameState.value !== 'ready') {
    return
  }

  if (!hasFreshBpm()) {
    pauseSession('Ожидание актуальных данных пульсометра.')
    return
  }

  hasShownSafetyWarning.value = true
  pauseMessage.value = null
  finishMessage.value = null
  gameTimer.resetTimer()
  gameTimer.startTimer()
  gameState.value = 'playing'
}

function resumeGame() {
  if (gameState.value !== 'paused') {
    return
  }

  if (!hasFreshBpm()) {
    pauseMessage.value = 'Ожидание актуальных данных пульсометра.'
    return
  }

  if (restingBpm.value === null) {
    startCalibration()
    return
  }

  pauseMessage.value = null
  gameTimer.startTimer()
  gameState.value = 'playing'
}

function pauseSession(message: string) {
  if (gameState.value === 'finished') {
    return
  }

  clearCalibrationTimers()
  gameTimer.pauseTimer()
  pauseMessage.value = message
  gameState.value = 'paused'
}

function finishGame(message = 'Вы нашли выход из лабиринта.') {
  if (gameState.value !== 'playing') {
    return
  }

  gameTimer.pauseTimer()
  finishMessage.value = message
  gameState.value = 'finished'
}

function startNewMaze() {
  if (gameState.value !== 'finished') {
    return
  }

  gameTimer.resetTimer()
  finishMessage.value = null
  mazeVersion.value += 1

  if (!hasFreshBpm()) {
    pauseMessage.value = 'Ожидание актуальных данных пульсометра.'
    gameState.value = 'paused'
    return
  }

  gameState.value = 'ready'
}

function hasFreshBpm(): boolean {
  if (currentRawBpm.value === null) {
    return false
  }

  if (debugHeartRate.isDebugHeartRate.value) {
    return true
  }

  if (bluetoothHeartRate.connectionState.value !== 'connected' || currentMeasurementAt.value === null) {
    return false
  }

  return performance.now() - currentMeasurementAt.value <= STALE_BPM_TIMEOUT_MS
}

function isActiveSessionState(state: GameState): boolean {
  return state === 'calibrating' || state === 'ready' || state === 'playing'
}

function clearCalibrationTimers() {
  if (calibrationTimerId !== null) {
    window.clearInterval(calibrationTimerId)
    calibrationTimerId = null
  }

  if (calibrationFinishId !== null) {
    window.clearTimeout(calibrationFinishId)
    calibrationFinishId = null
  }

  calibrationStartedAt = null
}

function ensureLifecycleListeners() {
  if (isLifecycleBound || typeof window === 'undefined') {
    return
  }

  isLifecycleBound = true
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.value === 'playing') {
      pauseSession('Игра приостановлена: вкладка скрыта.')
    }
  })
  window.setInterval(checkStaleBpm, 500)
}

function checkStaleBpm() {
  if (debugHeartRate.isDebugHeartRate.value || !isActiveSessionState(gameState.value)) {
    return
  }

  if (!hasFreshBpm()) {
    pauseSession('Игра приостановлена: данные пульса не поступают более трёх секунд.')
  }
}

watch(bluetoothHeartRate.connectionState, synchronizeConnectionState)
watch(
  [currentRawBpm, currentMeasurementAt],
  () => {
    recordCalibrationBpm()
    synchronizeConnectionState()
  },
)
watch(currentSmoothedBpm, (bpm) => {
  if (bpm === null) {
    return
  }

  pulseHistory.value = [...pulseHistory.value, bpm].slice(-PULSE_GRAPH_HISTORY_LENGTH)
}, { immediate: true })
watch(gameTimer.elapsedMs, (elapsedMs) => {
  if (gameState.value === 'playing' && elapsedMs >= MAX_SESSION_DURATION_MS) {
    finishGame('Сеанс завершён: достигнут лимит времени.')
  }
})
