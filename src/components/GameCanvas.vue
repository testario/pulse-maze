<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { PLAYER_START_RADIUS, SECTOR_ANGLE } from '../game/config'
import { generateMaze } from '../game/maze/generateMaze'
import type { PolarMaze } from '../game/maze/mazeTypes'
import { updatePlayer } from '../game/player/updatePlayer'
import { renderGame } from '../game/render/renderGame'
import type { PolarPosition } from '../game/types'
import { useGameLoop } from '../composables/useGameLoop'
import { useKeyboardInput } from '../composables/useKeyboardInput'

const containerElement = ref<HTMLDivElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)

const maze = generateMaze()

let playerPosition = createPlayerStartPosition(maze)

let context: CanvasRenderingContext2D | null = null
let canvasSize = 0
let resizeObserver: ResizeObserver | null = null

const { getAngularDirection } = useKeyboardInput()

const { startGameLoop, stopGameLoop } = useGameLoop((deltaTime) => {
  if (!context || canvasSize === 0) {
    return
  }

  playerPosition = updatePlayer(
    playerPosition,
    maze,
    { angularDirection: getAngularDirection(), radialDirection: 0 },
    deltaTime,
  )
  renderGame(context, canvasSize, maze, playerPosition)
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

  renderGame(context, canvasSize, maze, playerPosition)
}

function createPlayerStartPosition(maze: PolarMaze): PolarPosition {
  return {
    radius: PLAYER_START_RADIUS,
    angle: maze.centerExitSector * SECTOR_ANGLE + SECTOR_ANGLE / 2,
  }
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
