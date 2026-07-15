<script setup lang="ts">
defineProps<{
  connectionLabel: string
}>()
</script>

<template>
  <div class="product-preview" aria-label="Схема игрового интерфейса">
    <div class="product-preview__browser">
      <div class="product-preview__toolbar">
        <div class="product-preview__window-controls" aria-hidden="true">
          <span class="product-preview__window-control product-preview__window-control--active" />
          <span class="product-preview__window-control" />
          <span class="product-preview__window-control" />
        </div>
        <span class="product-preview__address" aria-hidden="true" />
      </div>

      <div class="product-preview__game">
        <svg viewBox="0 0 352 168" aria-hidden="true">
          <path class="product-preview__route" d="M22 84h58V44h86v64h72v-44h92" />
          <path class="product-preview__route-secondary" d="M54 68h54V48h74v52h116" />
          <circle class="product-preview__player" cx="267" cy="65" r="5" />
          <circle class="product-preview__target" cx="46" cy="84" r="4" />
        </svg>
      </div>

      <div class="product-preview__status">
        <span class="product-preview__status-indicator" />
        <span>{{ connectionLabel }}</span>
      </div>

      <div class="product-preview__telemetry">
        <div class="product-preview__bpm">
          <strong>78</strong>
          <span>BPM</span>
        </div>
        <svg class="product-preview__pulse" viewBox="0 0 70 18" aria-hidden="true">
          <path d="M0 9h10l7-10 7 19 8-14 6 5h14" />
        </svg>
      </div>
    </div>

    <span class="product-preview__sensor-link" aria-hidden="true" />
    <div class="product-preview__sensor">
      <span class="product-preview__sensor-core" />
      <span>BLE HEART RATE SERVICE</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid var(--pm-line);
  color: var(--pm-ink);
}

.product-preview__browser {
  display: grid;
  width: 81.6%;
  flex: 0 0 63.2%;
  margin-top: 11.6%;
  grid-template-columns: 6.86fr 2.94fr 30.88fr 2.94fr 46.08fr 3.43fr 6.86fr;
  grid-template-rows: 13.3fr 8.85fr 53.16fr 3.16fr 15.19fr 6.33fr;
  border: 1px solid currentColor;
  border-radius: 5.4%;
  background: var(--pm-bg);
}

.product-preview__toolbar {
  display: flex;
  grid-column: 1 / -1;
  grid-row: 1;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--pm-line);
  border-radius: 22px 22px 0 0;
  padding: 0 9.3% 0 6.25%;
}

.product-preview__window-controls {
  display: flex;
  gap: 8px;
}

.product-preview__window-control {
  width: 7px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--pm-line);
}

.product-preview__window-control--active {
  background: var(--pm-ink);
}

.product-preview__address {
  width: 27.5%;
  height: 33.3%;
  border: 1px solid var(--pm-line);
  border-radius: 999px;
  background: var(--pm-soft);
}

.product-preview__game {
  grid-column: 2 / 7;
  grid-row: 3;
  overflow: hidden;
  border: 1px solid var(--pm-line);
  border-radius: 12px;
  background: var(--pm-soft);
}

.product-preview__game svg {
  display: block;
  width: 100%;
  height: 100%;
}

.product-preview__route,
.product-preview__route-secondary {
  fill: none;
  stroke-width: 1;
}

.product-preview__route {
  stroke: currentColor;
}

.product-preview__route-secondary {
  stroke: var(--pm-line);
}

.product-preview__player {
  fill: currentColor;
}

.product-preview__target {
  fill: var(--pm-bg);
  stroke: currentColor;
  stroke-width: 1;
}

.product-preview__status,
.product-preview__sensor {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: var(--pm-bg);
  font-family: var(--pm-font-mono);
  font-size: clamp(0.45rem, 2vw, 0.625rem);
  font-weight: 500;
}

.product-preview__status {
  grid-column: 3;
  grid-row: 5;
  gap: 8px;
}

.product-preview__status-indicator {
  width: 7px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentColor;
}

.product-preview__telemetry {
  display: flex;
  grid-column: 5;
  grid-row: 5;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--pm-line);
  border-radius: 14px;
  background: var(--pm-bg);
  padding: 0 10.65%;
}

.product-preview__bpm {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-family: var(--pm-font-mono);
}

.product-preview__bpm strong {
  font-size: clamp(0.65rem, 4vw, 1.125rem);
  line-height: 1;
}

.product-preview__bpm span {
  color: var(--pm-muted);
  font-size: clamp(0.35rem, 2vw, 0.625rem);
  font-weight: 500;
}

.product-preview__pulse {
  width: 47.3%;
  height: 37.5%;
  overflow: visible;
}

.product-preview__pulse path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
}

.product-preview__sensor-link {
  flex: 0 0 5.6%;
  width: 1px;
  background: currentColor;
}

.product-preview__sensor {
  width: 40%;
  flex: 0 0 8.4%;
  gap: 12px;
  font-size: clamp(0.45rem, 2.2vw, 0.6875rem);
}

.product-preview__sensor-core {
  width: 12px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 760px) {
  .product-preview__window-controls {
    gap: 5px;
  }

  .product-preview__window-control,
  .product-preview__status-indicator {
    width: clamp(4px, 1.4vw, 7px);
  }

  .product-preview__status {
    gap: 5px;
  }

  .product-preview__sensor {
    gap: 7px;
  }

  .product-preview__sensor-core {
    width: clamp(7px, 2.4vw, 12px);
  }
}
</style>
