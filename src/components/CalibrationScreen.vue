<script setup lang="ts">
import { computed } from 'vue'

import { useGameSession } from '../composables/useGameSession'
import { useGameTranslations } from '../composables/useGameTranslations'
import { useMotionInput } from '../composables/useMotionInput'
import { formatGameTime } from '../utils/formatTime'

const {
  calibrationRemainingMs,
  gameState,
  hasShownSafetyWarning,
  pauseMessage,
  resumeGame,
  startGame,
} = useGameSession()
const {
  isMotionInputActive,
  isMotionInputAvailable,
  motionInputError,
  requestMotionInput,
} = useMotionInput()
const { gameText } = useGameTranslations()

const calibrationTime = computed(() => formatGameTime(calibrationRemainingMs.value))
const motionStatusMessage = computed(() => {
  if (isMotionInputActive.value) {
    return gameText.value.motionActive
  }

  return motionInputError.value
})

async function handleStartGame() {
  await enableMotionInput()
  startGame()
}

async function handleResumeGame() {
  await enableMotionInput()
  resumeGame()
}

async function enableMotionInput() {
  if (!isMotionInputAvailable.value || isMotionInputActive.value) {
    return
  }

  await requestMotionInput()
}
</script>

<template>
  <section class="calibration-screen" aria-live="polite">
    <template v-if="gameState === 'calibrating'">
      <p>{{ gameText.calibrating }}</p>
      <p>{{ gameText.remainingTime }} {{ calibrationTime }}</p>
    </template>

    <template v-else-if="gameState === 'ready'">
      <p v-if="!hasShownSafetyWarning">
        {{ gameText.pauseSafetyWarning }}
      </p>
      <p v-else>{{ gameText.calibrationComplete }}</p>
      <p v-if="motionStatusMessage" class="calibration-screen__motion-status">
        {{ motionStatusMessage }}
      </p>
      <button type="button" @click="handleStartGame">{{ gameText.start }}</button>
    </template>

    <template v-else-if="gameState === 'paused'">
      <p>{{ pauseMessage }}</p>
      <p v-if="motionStatusMessage" class="calibration-screen__motion-status">
        {{ motionStatusMessage }}
      </p>
      <button type="button" @click="handleResumeGame">{{ gameText.resume }}</button>
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

.calibration-screen__motion-status {
  font-size: 0.8125rem;
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
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  button {
    padding: 0.4rem 0.6rem;
  }
}
</style>
