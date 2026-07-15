<script setup lang="ts">
import { useGameSession } from '../composables/useGameSession'
import { useGameTranslations } from '../composables/useGameTranslations'

const { finishMessage, formattedTime, startNewMaze } = useGameSession()
const { gameText } = useGameTranslations()
</script>

<template>
  <section class="finish-screen" aria-live="polite">
    <p>{{ finishMessage }}</p>
    <p>{{ gameText.finishTime }} {{ formattedTime }}</p>
    <button type="button" @click="startNewMaze">{{ gameText.newMaze }}</button>
  </section>
</template>

<style lang="scss" scoped>
.finish-screen {
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
  .finish-screen {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  button {
    padding: 0.4rem 0.6rem;
  }
}
</style>
