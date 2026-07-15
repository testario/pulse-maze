<script setup lang="ts">
import { computed } from 'vue'

import CalibrationScreen from './components/CalibrationScreen.vue'
import FinishScreen from './components/FinishScreen.vue'
import GameCanvas from './components/GameCanvas.vue'
import GameHeader from './components/GameHeader.vue'
import { useGameSession } from './composables/useGameSession'

const { gameState } = useGameSession()
const showCalibrationScreen = computed(() => (
  ['calibrating', 'ready', 'paused'].includes(gameState.value)
))
</script>

<template>
  <div class="app-shell">
    <GameHeader />
    <main class="game-area">
      <CalibrationScreen v-if="showCalibrationScreen" />
      <FinishScreen v-else-if="gameState === 'finished'" />
      <GameCanvas />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  min-height: 100dvh;
  padding: 1.5rem;
}

.game-area {
  display: grid;
  align-content: center;
  gap: 1rem;
  min-height: calc(100dvh - 5.5rem);
  justify-items: center;
}

@media (max-width: 480px) {
  .app-shell {
    padding: 1rem;
  }

  .game-area {
    min-height: calc(100dvh - 4.5rem);
  }
}
</style>
