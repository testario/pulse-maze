<script setup lang="ts">
import GameCanvas from './components/GameCanvas.vue'
import GameHeader from './components/GameHeader.vue'
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
  min-height: 100dvh;
  padding: 1.5rem;
}

.game-area {
  display: grid;
  min-height: calc(100dvh - 5.5rem);
  place-items: center;
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
