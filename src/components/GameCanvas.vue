<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { ANGULAR_SPEED, PLAYER_START_RADIUS_RATIO } from '../game/config'
import { renderGameFrame } from '../game/render/renderGameFrame'
import { movePlayerAlongArc } from '../game/player/polarMath'
import type { PolarPosition } from '../game/types'
import { useGameLoop } from '../composables/useGameLoop'
import { useKeyboardInput } from '../composables/useKeyboardInput'

const containerElement = ref<HTMLDivElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)

const playerPosition: PolarPosition = {
  radius: 0,
  angle: -Math.PI / 2,
}

let context: CanvasRenderingContext2D | null = null
let canvasSize = 0
let resizeObserver: ResizeObserver | null = null

const { getAngularDirection } = useKeyboardInput()

const { startGameLoop, stopGameLoop } = useGameLoop((deltaTime) => {
  if (!context || canvasSize === 0) {
    return
  }

  movePlayerAlongArc(playerPosition, getAngularDirection(), ANGULAR_SPEED, deltaTime)
  renderGameFrame(context, canvasSize, playerPosition)
})

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
  playerPosition.radius = canvasSize * PLAYER_START_RADIUS_RATIO

  renderGameFrame(context, canvasSize, playerPosition)
}

onMounted(() => {
  resizeCanvas()

  if (containerElement.value) {
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(containerElement.value)
  }

  startGameLoop()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  stopGameLoop()
})
</script>

<template>
  <div ref="containerElement" class="game-canvas">
    <canvas ref="canvasElement" aria-label="Игровое поле Pulse Maze" />
  </div>
</template>

<style lang="scss" scoped>
.game-canvas {
  aspect-ratio: 1;
  max-height: 100%;
  width: min(100%, 42rem, calc(100dvh - 7.5rem));
}

canvas {
  display: block;
}
</style>
