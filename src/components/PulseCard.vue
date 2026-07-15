<script setup lang="ts">
import { computed } from 'vue'

import { useGameTranslations } from '../composables/useGameTranslations'

const GRAPH_WIDTH = 240
const GRAPH_HEIGHT = 64
const GRAPH_PADDING = 6

const props = defineProps<{
  bpm: number | null
  history: number[]
  isConnected: boolean
  status: string
}>()
const { gameText } = useGameTranslations()

const graphBounds = computed(() => {
  if (props.history.length === 0) {
    return { maximum: 100, minimum: 40 }
  }

  const minimum = Math.min(...props.history)
  const maximum = Math.max(...props.history)
  const padding = Math.max((maximum - minimum) / 2, 5)

  return {
    maximum: maximum + padding,
    minimum: minimum - padding,
  }
})

const graphPoints = computed(() => {
  if (props.history.length === 0) {
    return ''
  }

  const availableHeight = GRAPH_HEIGHT - GRAPH_PADDING * 2
  const availableWidth = GRAPH_WIDTH - GRAPH_PADDING * 2
  const range = graphBounds.value.maximum - graphBounds.value.minimum

  return props.history.map((value, index) => {
    const x = props.history.length === 1
      ? GRAPH_WIDTH / 2
      : GRAPH_PADDING + index * availableWidth / (props.history.length - 1)
    const y = GRAPH_PADDING + (graphBounds.value.maximum - value) / range * availableHeight

    return `${x},${y}`
  }).join(' ')
})

const lastPoint = computed(() => {
  if (props.history.length === 0) {
    return null
  }

  const points = graphPoints.value.split(' ')
  const [x, y] = points[points.length - 1].split(',')

  return { x, y }
})
</script>

<template>
  <section class="pulse-card" aria-live="polite">
    <div class="pulse-card__status">
      <span :class="['pulse-card__indicator', { 'pulse-card__indicator--connected': isConnected }]" />
      <span>{{ status }}</span>
    </div>

    <div class="pulse-card__content">
      <div class="pulse-card__bpm">
        <strong>{{ bpm === null ? '—' : Math.round(bpm) }}</strong>
        <span>BPM</span>
      </div>

      <svg class="pulse-card__chart" :viewBox="`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`" role="img" :aria-label="gameText.pulseGraph">
        <line
          class="pulse-card__guide"
          :x1="GRAPH_PADDING"
          :x2="GRAPH_WIDTH - GRAPH_PADDING"
          :y1="GRAPH_HEIGHT / 2"
          :y2="GRAPH_HEIGHT / 2"
        />
        <polyline v-if="graphPoints" class="pulse-card__line" :points="graphPoints" />
        <circle
          v-if="lastPoint"
          class="pulse-card__point"
          :cx="lastPoint.x"
          :cy="lastPoint.y"
          r="3"
        />
        <text v-else class="pulse-card__empty" :x="GRAPH_WIDTH / 2" :y="GRAPH_HEIGHT / 2 - 7">
          {{ gameText.noData }}
        </text>
      </svg>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.pulse-card {
  width: 100%;
  border: 1px solid #111111;
  padding: 0.75rem;
}

.pulse-card__status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.875rem;
}

.pulse-card__indicator {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: #b3261e;
}

.pulse-card__indicator--connected {
  background: #16803a;
}

.pulse-card__content {
  display: grid;
  grid-template-columns: auto minmax(8rem, 1fr);
  align-items: end;
  gap: 0.9rem;
  margin-top: 0.65rem;
}

.pulse-card__bpm {
  display: grid;
  gap: 0.1rem;
}

.pulse-card__bpm strong {
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-variant-numeric: tabular-nums;
  line-height: 0.9;
}

.pulse-card__bpm span {
  font-size: 0.875rem;
}

.pulse-card__chart {
  width: 100%;
  height: 4rem;
  overflow: visible;
}

.pulse-card__guide {
  stroke: #c6c6c1;
  stroke-width: 1;
}

.pulse-card__line {
  fill: none;
  stroke: #111111;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.pulse-card__point {
  fill: #9f1d2a;
}

.pulse-card__empty {
  fill: #5f5f5a;
  font-size: 12px;
  text-anchor: middle;
}

@media (max-width: 640px) {
  .pulse-card {
    padding: 0.5rem;
  }

  .pulse-card__status {
    gap: 0.35rem;
    font-size: 0.8125rem;
  }

  .pulse-card__content {
    grid-template-columns: auto minmax(6rem, 1fr);
    gap: 0.5rem;
    margin-top: 0.4rem;
  }

  .pulse-card__bpm strong {
    font-size: clamp(1.625rem, 8vw, 2rem);
  }

  .pulse-card__chart {
    height: 3rem;
  }
}
</style>
