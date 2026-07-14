<script setup lang="ts">
const title = 'Pulse Maze'
</script>

<template>
  <header class="game-header">
    <h1>{{ title }}</h1>
  </header>
</template>

<style lang="scss" scoped>
.game-header {
  display: flex;
  align-items: center;
  min-height: 2.5rem;
}

h1 {
  margin: 0;
  color: #111111;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}
</style>
