<script setup lang="ts">
import { computed, ref } from 'vue'

import BrowserSupportDialog from './BrowserSupportDialog.vue'
import { useBluetoothHeartRate } from '../composables/useBluetoothHeartRate'
import { useGameSession } from '../composables/useGameSession'
import { useGameTranslations } from '../composables/useGameTranslations'

const {
  connectHeartRateMonitor,
  connectionError,
  connectionState,
} = useBluetoothHeartRate()
const { gameState } = useGameSession()
const { gameText } = useGameTranslations()
const isBrowserSupportDialogOpen = ref(false)

const statusMessage = computed(() => {
  if (connectionState.value === 'unsupported') {
    return gameText.value.bluetoothUnavailable
  }

  if (connectionState.value === 'connecting') {
    return gameText.value.connecting
  }

  if (connectionState.value === 'connected') {
    if (gameState.value === 'connecting') {
      return gameText.value.connectedWaitingBpm
    }

    return gameText.value.connected
  }

  return connectionError.value ?? gameText.value.connectPrompt
})
</script>

<template>
  <section class="connection-screen" aria-live="polite">
    <p>
      {{ statusMessage }}
      <button
        v-if="connectionState === 'unsupported'"
        class="connection-screen__support-link"
        type="button"
        @click="isBrowserSupportDialogOpen = true"
      >
        {{ gameText.supportWhy }}
      </button>
    </p>
    <button
      v-if="connectionState === 'disconnected'"
      type="button"
      @click="connectHeartRateMonitor"
    >
      {{ gameText.connectHeartRateMonitor }}
    </button>

    <BrowserSupportDialog
      v-if="isBrowserSupportDialogOpen"
      :browser-list="gameText.browserSupport.browsers"
      :close-label="gameText.closeGuide"
      :description="gameText.browserSupport.description"
      :note="gameText.browserSupport.note"
      :supported-title="gameText.browserSupport.supportedTitle"
      :title="gameText.browserSupport.title"
      @close="isBrowserSupportDialogOpen = false"
    />
  </section>
</template>

<style lang="scss" scoped>
.connection-screen {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  align-items: center;
  text-align: center;
  gap: 1rem;
  border-top: 1px solid #111111;
  border-bottom: 1px solid #111111;
  padding: 0.75rem 0;
  font-size: 0.875rem;
}

p {
  margin: 0;
}

.connection-screen__support-link {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
}

.connection-screen__support-link:focus-visible {
  outline: 2px solid #111111;
  outline-offset: 2px;
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
  .connection-screen {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
    text-align: left;
  }

  button {
    padding: 0.4rem 0.6rem;
  }
}
</style>
