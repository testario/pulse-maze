<script setup lang="ts">
import { computed } from 'vue'

import { useGameSession } from '../composables/useGameSession'

const title = 'Pulse Maze'
const { currentSmoothedBpm, formattedTime, gameState } = useGameSession()

const connectionLabel = computed(() => {
  switch (gameState.value) {
    case 'calibrating':
      return 'Калибровка'
    case 'ready':
      return 'Готово к началу'
    case 'playing':
      return 'Игра начата'
    case 'paused':
      return 'Игра на паузе'
    case 'finished':
      return 'Маршрут завершён'
    case 'connecting':
      return 'Подключение…'
    case 'unsupported':
      return 'Bluetooth недоступен'
    default:
      return 'Пульсометр не подключён'
  }
})

const bpmLabel = computed(() => (
  currentSmoothedBpm.value === null ? 'BPM —' : `BPM ${Math.round(currentSmoothedBpm.value)}`
))
</script>

<template>
  <header class="game-header">
    <h1>{{ title }}</h1>
    <div class="status" aria-live="polite">
      <span>{{ connectionLabel }}</span>
      <span>{{ formattedTime }}</span>
      <span>{{ bpmLabel }}</span>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 2.5rem;
}

h1 {
  margin: 0;
  color: #111111;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.status {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem 1rem;
  font-size: 0.8125rem;
  text-align: right;
}
</style>
