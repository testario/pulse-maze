<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { generateMazeWithSteps, type MazeGenerationResult } from '../game/maze/generateMaze'
import { createClosedMaze, openMazePassage } from '../game/maze/mazeWalls'
import type { MazeCellCoordinate, PolarMaze } from '../game/maze/mazeTypes'
import { renderMazeGeneration } from '../game/render/renderMazeGeneration'
import { useGameTranslations } from '../composables/useGameTranslations'

const GENERATION_STEP_DURATION_MS = 85

const containerElement = ref<HTMLDivElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const generation = ref<MazeGenerationResult | null>(null)
const maze = ref<PolarMaze | null>(null)
const visitedCells = ref<MazeCellCoordinate[]>([])
const activeCell = ref<MazeCellCoordinate | null>(null)
const currentStep = ref(0)
const isPlaying = ref(false)

const { gameText } = useGameTranslations()
const totalSteps = computed(() => generation.value?.steps.length ?? 0)
const isComplete = computed(() => totalSteps.value > 0 && currentStep.value >= totalSteps.value)
const progressText = computed(() => (
  gameText.value.mazeGenerationProgress(currentStep.value, totalSteps.value)
))
const playButtonText = computed(() => (
  isPlaying.value ? gameText.value.pauseGeneration : gameText.value.continueGeneration
))

let context: CanvasRenderingContext2D | null = null
let canvasSize = 0
let resizeObserver: ResizeObserver | null = null
let animationFrameId: number | null = null
let lastFrameAt: number | null = null
let elapsedSinceStep = 0
let visitedCellIds = new Set<string>()

function togglePlayback() {
  if (isComplete.value) {
    return
  }

  isPlaying.value = !isPlaying.value
  lastFrameAt = null

  if (isPlaying.value) {
    startAnimation()
  }
}

function restartGeneration() {
  const nextGeneration = generateMazeWithSteps()

  generation.value = nextGeneration
  maze.value = createClosedMaze(nextGeneration.maze.centerExitSector, nextGeneration.maze.exitSector)
  visitedCells.value = []
  activeCell.value = null
  currentStep.value = 0
  visitedCellIds = new Set<string>()
  elapsedSinceStep = 0
  lastFrameAt = null
  isPlaying.value = true

  advanceGeneration()
  renderGeneration()
  startAnimation()
}

function resizeCanvas() {
  const container = containerElement.value
  const canvas = canvasElement.value

  if (!container || !canvas) {
    return
  }

  const size = Math.floor(Math.min(container.clientWidth, container.clientHeight))

  if (size <= 0) {
    return
  }

  const devicePixelRatio = window.devicePixelRatio || 1

  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  canvas.width = Math.round(size * devicePixelRatio)
  canvas.height = Math.round(size * devicePixelRatio)

  context = canvas.getContext('2d')

  if (!context) {
    return
  }

  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  canvasSize = size
  renderGeneration()
}

function startAnimation() {
  if (animationFrameId !== null) {
    return
  }

  animationFrameId = window.requestAnimationFrame(animateGeneration)
}

function animateGeneration(timestamp: number) {
  animationFrameId = null

  if (!isPlaying.value) {
    return
  }

  if (lastFrameAt === null) {
    lastFrameAt = timestamp
  }

  elapsedSinceStep += Math.min(timestamp - lastFrameAt, GENERATION_STEP_DURATION_MS)
  lastFrameAt = timestamp

  while (elapsedSinceStep >= GENERATION_STEP_DURATION_MS && isPlaying.value) {
    elapsedSinceStep -= GENERATION_STEP_DURATION_MS
    advanceGeneration()
  }

  if (isPlaying.value) {
    startAnimation()
  }
}

function advanceGeneration() {
  const nextStep = generation.value?.steps[currentStep.value]
  const currentMaze = maze.value

  if (!nextStep || !currentMaze) {
    isPlaying.value = false
    return
  }

  if (nextStep.type !== 'backtrack') {
    openMazePassage(currentMaze, nextStep.coordinate, nextStep.wall)
  }

  if (nextStep.type === 'start' || nextStep.type === 'carve') {
    addVisitedCell(nextStep.activeCell)
  }

  activeCell.value = nextStep.activeCell
  currentStep.value += 1
  renderGeneration()

  if (currentStep.value >= totalSteps.value) {
    isPlaying.value = false
  }
}

function addVisitedCell(cell: MazeCellCoordinate) {
  const cellId = `${cell.ring}:${cell.sector}`

  if (visitedCellIds.has(cellId)) {
    return
  }

  visitedCellIds.add(cellId)
  visitedCells.value = [...visitedCells.value, cell]
}

function renderGeneration() {
  if (!context || canvasSize === 0 || !maze.value) {
    return
  }

  renderMazeGeneration(
    context,
    canvasSize,
    maze.value,
    visitedCells.value,
    activeCell.value,
  )
}

onMounted(() => {
  resizeCanvas()

  if (containerElement.value) {
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(containerElement.value)
  }

  restartGeneration()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()

  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <section class="maze-generation" :aria-label="gameText.mazeGeneration">
    <header class="maze-generation__header">
      <div>
        <p>Pulse Maze</p>
        <h1>{{ gameText.mazeGeneration }}</h1>
      </div>
      <p class="maze-generation__progress" aria-live="polite">
        {{ isComplete ? gameText.generationComplete : progressText }}
      </p>
    </header>

    <div ref="containerElement" class="maze-generation__canvas">
      <canvas ref="canvasElement" :aria-label="gameText.mazeGenerationCanvas" />
    </div>

    <div class="maze-generation__controls">
      <button type="button" :disabled="isComplete" @click="togglePlayback">
        {{ playButtonText }}
      </button>
      <button type="button" @click="restartGeneration">
        {{ gameText.restartGeneration }}
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.maze-generation {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 1rem;
  height: 100%;
  min-height: 0;
  width: min(100%, 42rem);
}

.maze-generation__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.maze-generation__header p,
.maze-generation__header h1 {
  margin: 0;
}

.maze-generation__header > div > p {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.maze-generation__progress {
  font-size: 0.875rem;
  text-align: right;
}

.maze-generation__canvas {
  display: grid;
  min-height: 0;
  place-items: center;
}

canvas {
  display: block;
}

.maze-generation__controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

button {
  border: 1px solid #111111;
  border-radius: 0;
  background: transparent;
  color: #111111;
  cursor: pointer;
  font: inherit;
  padding: 0.45rem 0.75rem;
}

button:disabled {
  cursor: default;
  opacity: 0.5;
}

button:not(:disabled):focus-visible,
button:not(:disabled):hover {
  outline: 2px solid #111111;
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .maze-generation__header {
    align-items: start;
    flex-direction: column;
    gap: 0.25rem;
  }

  .maze-generation__progress {
    text-align: left;
  }
}
</style>
