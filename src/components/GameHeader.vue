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

@media (max-width: 640px) {
  .game-header__main {
    grid-template-columns: 1fr;
  }
}
</style>
