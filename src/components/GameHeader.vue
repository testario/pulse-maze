<script setup lang="ts">
import { computed } from 'vue'

import PulseCard from './PulseCard.vue'
import ConnectionScreen from './ConnectionScreen.vue'
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

const gameStatus = computed(() => {
  switch (gameState.value) {
    case 'calibrating': return 'Калибровка'
    case 'ready': return 'Готово к началу'
    case 'playing': return 'Игра начата'
    case 'paused': return 'Игра на паузе'
    case 'finished': return 'Маршрут завершён'
    default: return ''
  }
})
</script>

<template>
  <header class="game-header">
    <div class="game-header__main">
      <div class="game-header__title">
        <h1>{{ title }}</h1>
        <div class="game-header__meta" aria-live="polite">
          <span v-if="gameStatus">{{ gameStatus }}</span>
          <span>{{ formattedTime }}</span>
        </div>
      </div>
      <div class="game-header__connection">
        <ConnectionScreen v-if="showConnectionScreen" />
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
  align-items: flex-start;
  gap: 1rem;
}

.game-header__title {
  display: grid;
  gap: 0.45rem;
  width: 100%;
}

.game-header__connection,
.game-header__pulse {
  width: 100%;
}

h1 {
  margin: 0;
  color: #111111;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.game-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 1rem;
}

@media (max-width: 640px) {
  .game-header__main {
    grid-template-columns: 1fr;
  }
}
</style>
