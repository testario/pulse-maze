<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  browserList: string
  closeLabel: string
  description: string
  note: string
  supportedTitle: string
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const closeButton = ref<HTMLButtonElement | null>(null)

function closeDialog() {
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDialog()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  await nextTick()
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="browser-support-overlay" @click.self="closeDialog">
    <section
      class="browser-support-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="browser-support-title"
      aria-describedby="browser-support-description"
    >
      <div class="browser-support-dialog__header">
        <p class="browser-support-dialog__eyebrow">PULSE MAZE</p>
        <button
          ref="closeButton"
          class="browser-support-dialog__close"
          type="button"
          :aria-label="closeLabel"
          @click="closeDialog"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path d="m3 3 10 10M13 3 3 13" />
          </svg>
        </button>
      </div>

      <h2 id="browser-support-title">{{ title }}</h2>
      <p id="browser-support-description" class="browser-support-dialog__description">
        {{ description }}
      </p>

      <div class="browser-support-dialog__supported">
        <p class="browser-support-dialog__label">{{ supportedTitle }}</p>
        <p>{{ browserList }}</p>
      </div>

      <p class="browser-support-dialog__note">{{ note }}</p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.browser-support-overlay {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgb(10 10 10 / 38%);
}

.browser-support-dialog {
  display: grid;
  width: min(100%, 32rem);
  gap: 1.25rem;
  border: 1px solid var(--pm-ink, #111111);
  border-radius: 16px;
  background: var(--pm-bg, #fbfbf9);
  color: var(--pm-ink, #111111);
  padding: 1.5rem;
}

.browser-support-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.browser-support-dialog__eyebrow,
.browser-support-dialog__label,
.browser-support-dialog p,
h2 {
  margin: 0;
}

.browser-support-dialog__eyebrow,
.browser-support-dialog__label {
  color: var(--pm-muted, #666666);
  font-family: var(--pm-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 0.75rem;
  font-weight: 500;
}

h2 {
  font-family: var(--pm-font-heading, Inter, ui-sans-serif, system-ui, sans-serif);
  font-size: 2rem;
  font-weight: 620;
  letter-spacing: -0.05em;
  line-height: 1;
}

.browser-support-dialog__description,
.browser-support-dialog__note {
  color: var(--pm-muted, #666666);
  font-size: 1rem;
  line-height: 1.45;
}

.browser-support-dialog__supported {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--pm-line, #dcdcdc);
  border-radius: 10px;
}

.browser-support-dialog__supported p:last-child {
  font-size: 1rem;
  line-height: 1.4;
}

.browser-support-dialog__close {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--pm-line, #dcdcdc);
  border-radius: 50%;
  background: transparent;
  color: var(--pm-ink, #111111);
  cursor: pointer;
  padding: 0;
}

.browser-support-dialog__close svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}

.browser-support-dialog__close:hover {
  border-color: var(--pm-ink, #111111);
}

.browser-support-dialog__close:focus-visible {
  outline: 2px solid var(--pm-ink, #111111);
  outline-offset: 3px;
}

@media (max-width: 480px) {
  .browser-support-overlay {
    padding: 0.75rem;
  }

  .browser-support-dialog {
    padding: 1.25rem;
  }
}
</style>
