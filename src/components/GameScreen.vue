<script setup lang="ts">
import GameCanvas from './GameCanvas.vue'
import GameHeader from './GameHeader.vue'
</script>

<template>
  <div class="app-shell">
    <GameHeader />
    <main class="game-area">
      <GameCanvas />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
  padding: 1.5rem;
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
    padding: 1rem;
  }

}
</style>
