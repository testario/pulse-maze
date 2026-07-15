<script setup lang="ts">
import { computed } from 'vue'

import CalibrationScreen from './CalibrationScreen.vue'
import ConnectionScreen from './ConnectionScreen.vue'
import FinishScreen from './FinishScreen.vue'
import PulseCard from './PulseCard.vue'
import { useBluetoothHeartRate } from '../composables/useBluetoothHeartRate'
import { useGameSession } from '../composables/useGameSession'
import { isDebugHeartRateEnabled } from '../composables/useHeartRateControl'

const title = 'Pulse Maze'
const isDebugHeartRate = isDebugHeartRateEnabled()
const {
  currentSmoothedBpm,
  formattedTime,
  gameState,
  pulseHistory,
} = useGameSession()
const { connectionState } = useBluetoothHeartRate()

const pulseStatus = computed(() => {
  if (isDebugHeartRate) {
    return 'Эмулятор пульса'
  }

  switch (connectionState.value) {
    case 'connected':
      return 'Пульсометр подключён'
    case 'connecting':
      return 'Подключение…'
    case 'unsupported':
      return 'Bluetooth недоступен'
    default:
      return 'Пульсометр не подключён'
  }
})

const isPulseMonitorConnected = computed(() => connectionState.value === 'connected')
const showConnectionScreen = computed(() => (
  !isDebugHeartRate && (
    ['unsupported', 'disconnected', 'connecting'].includes(connectionState.value)
    || (connectionState.value === 'connected' && gameState.value === 'connecting')
  )
))
const showCalibrationScreen = computed(() => (
  ['calibrating', 'ready', 'paused'].includes(gameState.value)
))

</script>

<template>
  <header class="game-header">
    <div class="game-header__main">
      <div class="game-header__title">
        <h1>{{ title }}</h1>
        <a
          class="game-header__github-link"
          href="https://github.com/testario/pulse-maze"
          target="_blank"
          rel="noreferrer"
          aria-label="Проект на GitHub"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.44c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.93.68 1.88 0 1.36-.01 2.45-.01 2.78 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
          </svg>
        </a>
      </div>
      <div class="game-header__connection">
        <p v-if="gameState === 'playing'" class="game-header__timer" aria-live="polite">
          {{ formattedTime }}
        </p>
        <ConnectionScreen v-if="showConnectionScreen" />
        <CalibrationScreen v-else-if="showCalibrationScreen" />
        <FinishScreen v-else-if="gameState === 'finished'" />
      </div>
      <PulseCard
        class="game-header__pulse"
        :bpm="currentSmoothedBpm"
        :history="pulseHistory"
        :is-connected="isPulseMonitorConnected"
        :status="pulseStatus"
      />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.game-header {
  display: grid;
  gap: 1rem;
}

.game-header__main {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 10%;
}

.game-header__title {
  width: 100%;
  align-self: start;
}

.game-header__connection,
.game-header__pulse {
  width: 100%;
}

.game-header__connection {
  display: grid;
  gap: 0.75rem;
}

.game-header__timer {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  line-height: 0.9;
  text-align: center;
}

h1 {
  margin: 0;
  color: #111111;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.game-header__github-link {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  margin-top: 0.4rem;
  color: #111111;
}

.game-header__github-link svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.game-header__github-link:focus-visible {
  outline: 2px solid #111111;
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .game-header__main {
    grid-template-columns: 1fr;
  }
}
</style>
