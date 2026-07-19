<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import GameCanvas from './GameCanvas.vue'
import GameGuideDialog from './GameGuideDialog.vue'
import GameHeader from './GameHeader.vue'
import MazeGenerationPreview from './MazeGenerationPreview.vue'
import { useGameTranslations } from '../composables/useGameTranslations'
import { useLanguagePreferences, type Language } from '../composables/useLanguagePreferences'

const GAME_GUIDE_SEEN_STORAGE_KEY = 'pulse-maze-game-guide-seen'

const route = useRoute()
const isGameGuideOpen = ref(false)
const {
  initializePreferences,
  setLanguage,
} = useLanguagePreferences()
const { gameText, language } = useGameTranslations()
const isMazeGenerationPreview = computed(() => route.query.stepMazeGen !== undefined)
const nextLanguage = computed<Language>(() => (language.value === 'ru' ? 'en' : 'ru'))

function toggleLanguage() {
  setLanguage(nextLanguage.value)
}

function openGameGuide() {
  isGameGuideOpen.value = true
}

function closeGameGuide() {
  isGameGuideOpen.value = false
  markGameGuideAsSeen()
}

function hasSeenGameGuide(): boolean {
  try {
    return window.localStorage.getItem(GAME_GUIDE_SEEN_STORAGE_KEY) === 'true'
  } catch (error) {
    console.error('Не удалось прочитать состояние гайда.', error)
    return true
  }
}

function markGameGuideAsSeen() {
  try {
    window.localStorage.setItem(GAME_GUIDE_SEEN_STORAGE_KEY, 'true')
  } catch (error) {
    console.error('Не удалось сохранить состояние гайда.', error)
  }
}

onMounted(() => {
  initializePreferences()

  if (!isMazeGenerationPreview.value && !hasSeenGameGuide()) {
    isGameGuideOpen.value = true
  }
})
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--generation': isMazeGenerationPreview }">
    <GameHeader v-if="!isMazeGenerationPreview" />
    <button
      v-if="!isMazeGenerationPreview"
      class="game-guide-button"
      type="button"
      :aria-label="gameText.guideButtonLabel"
      @click="openGameGuide"
    >
      ?
    </button>
    <button
      class="game-language-button"
      type="button"
      :aria-label="gameText.languageLabel"
      @click="toggleLanguage"
    >
      {{ nextLanguage.toUpperCase() }}
    </button>
    <main class="game-area">
      <MazeGenerationPreview v-if="isMazeGenerationPreview" />
      <GameCanvas v-else />
    </main>
    <GameGuideDialog v-if="!isMazeGenerationPreview && isGameGuideOpen" @close="closeGameGuide" />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
  padding: 1.5rem;
}

.app-shell--generation {
  grid-template-rows: minmax(0, 1fr);
}

.game-guide-button {
  position: absolute;
  z-index: 5;
  right: 1.5rem;
  bottom: 1.5rem;
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid #111111;
  background: #fbfbf9;
  color: #111111;
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  padding: 0;
}

.game-language-button {
  position: absolute;
  z-index: 5;
  right: 4.25rem;
  bottom: 1.5rem;
  display: grid;
  height: 2.25rem;
  min-width: 2.75rem;
  place-items: center;
  border: 1px solid #111111;
  background: #fbfbf9;
  color: #111111;
  cursor: pointer;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0 0.5rem;
}

.game-guide-button:focus-visible,
.game-guide-button:hover,
.game-language-button:focus-visible,
.game-language-button:hover {
  outline: 2px solid #111111;
  outline-offset: 2px;
}

.game-area {
  display: flex;
  min-height: 0;
  min-width: 0;
  align-items: center;
  justify-content: center;
}

@media (max-width: 480px) {
  .app-shell {
    padding: 0.75rem;
  }

  .game-guide-button {
    right: 0.75rem;
    bottom: 0.75rem;
    width: 2rem;
    height: 2rem;
  }

  .game-language-button {
    right: 3.25rem;
    bottom: 0.75rem;
    height: 2rem;
    min-width: 2.5rem;
  }
}
</style>
