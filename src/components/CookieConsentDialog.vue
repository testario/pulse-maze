<script setup lang="ts">
defineProps<{
  acceptLabel: string
  declineLabel: string
  description: string
  title: string
}>()

defineEmits<{
  accept: []
  decline: []
}>()
</script>

<template>
  <div class="site-preferences-overlay">
    <section class="site-preferences-panel" role="dialog" aria-modal="true" :aria-label="title">
      <p class="site-preferences-panel__eyebrow">PULSE MAZE</p>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <div class="site-preferences-panel__actions">
        <button class="site-preferences-panel__accept" type="button" @click="$emit('accept')">
          {{ acceptLabel }}
        </button>
        <button class="site-preferences-panel__decline" type="button" @click="$emit('decline')">
          {{ declineLabel }}
        </button>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.site-preferences-overlay {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 1.25rem;
  pointer-events: none;
}

.site-preferences-panel {
  display: grid;
  width: min(100%, 22rem);
  gap: 0.875rem;
  border: 1px solid var(--pm-ink);
  border-radius: 14px;
  background: var(--pm-bg);
  color: var(--pm-ink);
  padding: 1.25rem;
  pointer-events: auto;
}

.site-preferences-panel__eyebrow {
  margin: 0;
  color: var(--pm-muted);
  font-family: var(--pm-font-mono);
  font-size: 0.75rem;
  font-weight: 500;
}

h2,
p {
  margin: 0;
}

h2 {
  font-family: var(--pm-font-heading);
  font-size: 1.375rem;
  font-weight: 620;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

p:not(.site-preferences-panel__eyebrow) {
  color: var(--pm-muted);
  font-size: 0.875rem;
  line-height: 1.45;
}

.site-preferences-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

button {
  border: 1px solid var(--pm-ink);
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  padding: 0.65rem 0.9rem;
}

.site-preferences-panel__accept {
  background: var(--pm-ink);
  color: var(--pm-bg);
}

.site-preferences-panel__decline {
  background: transparent;
  color: var(--pm-ink);
}

button:focus-visible {
  outline: 2px solid var(--pm-ink);
  outline-offset: 3px;
}

@media (max-width: 480px) {
  .site-preferences-overlay {
    padding: 0.75rem;
  }
}
</style>
