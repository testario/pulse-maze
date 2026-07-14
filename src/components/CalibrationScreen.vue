<script setup lang="ts">
import { computed } from 'vue'

import { useGameSession } from '../composables/useGameSession'
import { formatGameTime } from '../utils/formatTime'

const {
  calibrationRemainingMs,
  gameState,
  hasShownSafetyWarning,
  pauseMessage,
  resumeGame,
  startGame,
} = useGameSession()

const calibrationTime = computed(() => formatGameTime(calibrationRemainingMs.value))
</script>

<template>
  <section class="calibration-screen" aria-live="polite">
    <template v-if="gameState === 'calibrating'">
      <p>Калибровка пульса. Оставайтесь в спокойном состоянии.</p>
      <p>Осталось: {{ calibrationTime }}</p>
    </template>

    <template v-else-if="gameState === 'ready'">
      <p v-if="!hasShownSafetyWarning">
        Прекратите игру, если почувствуете головокружение или дискомфорт.
      </p>
      <p v-else>Калибровка завершена. Можно начать новый маршрут.</p>
      <button type="button" @click="startGame">Начать</button>
    </template>

    <template v-else-if="gameState === 'paused'">
      <p>{{ pauseMessage }}</p>
      <button type="button" @click="resumeGame">Продолжить</button>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.calibration-screen {
  display: flex;
  width: min(100%, 42rem);
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #111111;
  border-bottom: 1px solid #111111;
  padding: 0.75rem 0;
  font-size: 0.875rem;
}

p {
  margin: 0;
}

button {
  flex: 0 0 auto;
  border: 1px solid #111111;
  border-radius: 0;
  background: transparent;
  color: #111111;
  cursor: pointer;
  font: inherit;
  padding: 0.5rem 0.75rem;
}

@media (max-width: 480px) {
  .calibration-screen {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
