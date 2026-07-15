<script setup lang="ts">
import { computed, ref } from 'vue'

import BrowserSupportDialog from './BrowserSupportDialog.vue'
import { useBluetoothHeartRate } from '../composables/useBluetoothHeartRate'
import { useGameSession } from '../composables/useGameSession'

const {
  connectHeartRateMonitor,
  connectionError,
  connectionState,
} = useBluetoothHeartRate()
const { gameState } = useGameSession()
const isBrowserSupportDialogOpen = ref(false)

const statusMessage = computed(() => {
  if (connectionState.value === 'unsupported') {
    return 'Web Bluetooth не поддерживается этим браузером.'
  }

  if (connectionState.value === 'connecting') {
    return 'Подключение к пульсометру…'
  }

  if (connectionState.value === 'connected') {
    if (gameState.value === 'connecting') {
      return 'Пульсометр подключён. Ожидание данных пульса…'
    }

    return 'Пульсометр подключён.'
  }

  return connectionError.value ?? 'Подключите совместимый BLE-пульсометр для управления движением.'
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
        Почему?
      </button>
    </p>
    <button
      v-if="connectionState === 'disconnected'"
      type="button"
      @click="connectHeartRateMonitor"
    >
      Подключить пульсометр
    </button>

    <BrowserSupportDialog
      v-if="isBrowserSupportDialogOpen"
      browser-list="Нужную технологию подключения поддерживают Chrome, Edge, Brave и Opera."
      close-label="Закрыть"
      description="Для подключения пульсометра Pulse Maze использует Web Bluetooth."
      note="Для стабильной работы используйте актуальную версию браузера для компьютера и разрешите доступ к Bluetooth, когда появится запрос."
      supported-title="Используйте браузер на Chromium"
      title="Поддержка браузеров"
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
  }
}
</style>
