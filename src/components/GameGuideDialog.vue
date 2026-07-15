<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { useGameTranslations } from '../composables/useGameTranslations'
import { isDebugHeartRateEnabled } from '../composables/useHeartRateControl'

type GuidePlatform = 'desktop' | 'mobile-motion' | 'mobile-no-motion'

interface GuideContent {
  note: string
  steps: string[]
  title: string
}

const emit = defineEmits<{
  close: []
}>()

const closeButton = ref<HTMLButtonElement | null>(null)
const guidePlatform = ref<GuidePlatform>(getGuidePlatform())
const isDebugHeartRate = isDebugHeartRateEnabled()
const { gameText } = useGameTranslations()

const guideContent = computed(() => getGuideContent(guidePlatform.value, isDebugHeartRate))

function closeDialog() {
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDialog()
  }
}

function getGuidePlatform(): GuidePlatform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'desktop'
  }

  const isTouchDevice = navigator.maxTouchPoints > 0

  if (!isTouchDevice) {
    return 'desktop'
  }

  return 'DeviceOrientationEvent' in window ? 'mobile-motion' : 'mobile-no-motion'
}

function getGuideContent(platform: GuidePlatform, isDebug: boolean): GuideContent {
  if (isDebug) {
    return getDebugGuideContent(platform)
  }

  if (platform === 'mobile-motion') {
    return {
      title: gameText.value.mobileGuideTitle,
      steps: [...gameText.value.mobileGuideSteps],
      note: gameText.value.mobileGuideNote,
    }
  }

  if (platform === 'mobile-no-motion') {
    return {
      title: gameText.value.mobileNoMotionTitle,
      steps: [...gameText.value.mobileNoMotionSteps],
      note: gameText.value.mobileNoMotionNote,
    }
  }

  return {
    title: gameText.value.desktopGuideTitle,
    steps: [...gameText.value.desktopGuideSteps],
    note: gameText.value.desktopGuideNote,
  }
}

function getDebugGuideContent(platform: GuidePlatform): GuideContent {
  if (platform === 'mobile-motion') {
    return {
      title: gameText.value.debugMobileTitle,
      steps: [...gameText.value.debugMobileSteps],
      note: gameText.value.debugMobileNote,
    }
  }

  return {
    title: gameText.value.debugComputerTitle,
    steps: [...gameText.value.debugComputerSteps],
    note: gameText.value.debugComputerNote,
  }
}

onMounted(async () => {
  guidePlatform.value = getGuidePlatform()
  window.addEventListener('keydown', handleKeydown)
  await nextTick()
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="game-guide-overlay" @click.self="closeDialog">
    <section
      class="game-guide-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-guide-title"
      aria-describedby="game-guide-note"
    >
      <div class="game-guide-dialog__header">
        <p class="game-guide-dialog__eyebrow">{{ gameText.guideEyebrow }}</p>
        <button
          ref="closeButton"
          class="game-guide-dialog__close"
          type="button"
          :aria-label="gameText.closeGuide"
          @click="closeDialog"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path d="m3 3 10 10M13 3 3 13" />
          </svg>
        </button>
      </div>

      <h2 id="game-guide-title">{{ guideContent.title }}</h2>

      <ol>
        <li v-for="step in guideContent.steps" :key="step">{{ step }}</li>
      </ol>

      <p id="game-guide-note" class="game-guide-dialog__note">{{ guideContent.note }}</p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.game-guide-overlay {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(10 10 10 / 38%);
}

.game-guide-dialog {
  display: grid;
  width: min(100%, 34rem);
  max-height: calc(100dvh - 2rem);
  gap: 1rem;
  overflow: auto;
  border: 1px solid #111111;
  background: #fbfbf9;
  color: #111111;
  padding: 1.25rem;
}

.game-guide-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.game-guide-dialog__eyebrow,
h2,
ol,
.game-guide-dialog__note {
  margin: 0;
}

.game-guide-dialog__eyebrow {
  color: #5f5f5a;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.1;
}

ol {
  display: grid;
  gap: 0.65rem;
  padding-left: 1.25rem;
  line-height: 1.4;
}

.game-guide-dialog__note {
  border-top: 1px solid #111111;
  color: #5f5f5a;
  font-size: 0.875rem;
  line-height: 1.4;
  padding-top: 0.75rem;
}

.game-guide-dialog__close {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #111111;
  background: transparent;
  color: #111111;
  cursor: pointer;
  padding: 0;
}

.game-guide-dialog__close svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}

.game-guide-dialog__close:focus-visible,
.game-guide-dialog__close:hover {
  outline: 2px solid #111111;
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .game-guide-overlay {
    padding: 0.75rem;
  }

  .game-guide-dialog {
    gap: 0.875rem;
    padding: 1rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}
</style>
