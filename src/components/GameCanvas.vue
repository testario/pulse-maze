<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  MAZE_CENTER_RADIUS,
  PLAYER_START_RADIUS,
  SECTOR_ANGLE,
} from '../game/config'
import { generateMaze } from '../game/maze/generateMaze'
import { getSectorForAngle } from '../game/maze/mazeNeighbors'
import type { PolarMaze } from '../game/maze/mazeTypes'
import { getRingForRadius } from '../game/player/collision'
import { updatePlayer } from '../game/player/updatePlayer'
import { hasPlayerWon } from '../game/player/win'
import { renderGame } from '../game/render/renderGame'
import type { PolarPosition } from '../game/types'
import { useGameLoop } from '../composables/useGameLoop'
import { useGameSession } from '../composables/useGameSession'
import { useHeartRateControl } from '../composables/useHeartRateControl'
import { useKeyboardInput } from '../composables/useKeyboardInput'

const containerElement = ref<HTMLDivElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)

const maze = ref(generateMaze())

const playerPosition = ref(createPlayerStartPosition(maze.value))

let context: CanvasRenderingContext2D | null = null
let canvasSize = 0
let resizeObserver: ResizeObserver | null = null

const { getAngularDirection } = useKeyboardInput()
const {
  isDebugHeartRate,
  rawBpm,
  smoothedBpm,
} = useHeartRateControl()
const {
  finishGame,
  gameState,
  mazeVersion,
  radialFactor,
  restingBpm,
} = useGameSession()

const debugCell = computed(() => getDebugCell(playerPosition.value))

const { startGameLoop, stopGameLoop } = useGameLoop((deltaTime) => {
  if (!context || canvasSize === 0) {
    return
  }

  if (gameState.value === 'playing') {
    playerPosition.value = updatePlayer(
      playerPosition.value,
      maze.value,
      { angularDirection: getAngularDirection(), radialFactor: radialFactor.value },
      deltaTime,
    )

    if (hasPlayerWon(maze.value, playerPosition.value)) {
      finishGame()
    }
  }

  renderGame(context, canvasSize, maze.value, playerPosition.value)
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

  renderGame(context, canvasSize, maze.value, playerPosition.value)
}

function createPlayerStartPosition(maze: PolarMaze): PolarPosition {
  return {
    radius: PLAYER_START_RADIUS,
    angle: maze.centerExitSector * SECTOR_ANGLE + SECTOR_ANGLE / 2,
  }
}

function getDebugCell(position: PolarPosition): string {
  const ring = getRingForRadius(position.radius)

  if (ring === null) {
    return position.radius < MAZE_CENTER_RADIUS ? 'Центр лабиринта' : 'Внешняя зона'
  }

  return `Кольцо ${ring + 1}, сектор ${getSectorForAngle(position.angle) + 1}`
}

watch(mazeVersion, () => {
  maze.value = generateMaze()
  playerPosition.value = createPlayerStartPosition(maze.value)
})

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
  <div class="game-canvas-wrapper">
    <div ref="containerElement" class="game-canvas">
      <canvas ref="canvasElement" aria-label="Игровое поле Pulse Maze" />
    </div>

    <aside v-if="isDebugHeartRate" class="debug-panel" aria-label="Параметры debug-управления">
      <dl>
        <div>
          <dt>Базовый BPM</dt>
          <dd>{{ restingBpm ?? '—' }}</dd>
        </div>
        <div>
          <dt>Raw BPM</dt>
          <dd>{{ rawBpm }}</dd>
        </div>
        <div>
          <dt>Smoothed BPM</dt>
          <dd>{{ smoothedBpm.toFixed(1) }}</dd>
        </div>
        <div>
          <dt>Радиус</dt>
          <dd>{{ playerPosition.radius.toFixed(1) }}</dd>
        </div>
        <div>
          <dt>Угол</dt>
          <dd>{{ playerPosition.angle.toFixed(2) }}</dd>
        </div>
        <div>
          <dt>Позиция</dt>
          <dd>{{ debugCell }}</dd>
        </div>
      </dl>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.game-canvas-wrapper {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 0.75rem;
  height: 100%;
  min-height: 0;
  width: min(100%, 42rem);
}

.game-canvas {
  display: grid;
  place-items: center;
  height: 100%;
  min-height: 0;
  width: 100%;
}

canvas {
  display: block;
}

.debug-panel {
  border-top: 1px solid #111111;
  padding-top: 0.75rem;
  font-size: 0.8125rem;
}

dl {
  display: grid;
  gap: 0.25rem;
  margin: 0;
}

dl > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

dt,
dd {
  margin: 0;
}

dd {
  text-align: right;
}
</style>
