<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  DEBUG_MOTION_RADIAL_SENSITIVITY,
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
import { useGameTranslations } from '../composables/useGameTranslations'
import { useHeartRateControl } from '../composables/useHeartRateControl'
import { useKeyboardInput } from '../composables/useKeyboardInput'
import { useMotionInput } from '../composables/useMotionInput'

const containerElement = ref<HTMLDivElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)

const maze = ref(generateMaze())

const playerPosition = ref(createPlayerStartPosition(maze.value))

let context: CanvasRenderingContext2D | null = null
let canvasSize = 0
let resizeObserver: ResizeObserver | null = null

const { getAngularDirection: getKeyboardAngularDirection } = useKeyboardInput()
const {
  getAngularDirection: getMotionAngularDirection,
  getRadialFactor: getMotionRadialFactor,
  isMotionInputActive,
  isMotionInputAvailable,
  motionInputError,
  motionInputState,
  requestMotionInput,
  tiltBeta,
  tiltGamma,
} = useMotionInput()
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
const { gameText } = useGameTranslations()

const debugCell = computed(() => getDebugCell(playerPosition.value))
const debugMotionStatus = computed(() => {
  if (!isMotionInputAvailable.value) {
    return motionInputError.value ?? gameText.value.motionUnavailable
  }

  if (isMotionInputActive.value) {
    return gameText.value.motionActive
  }

  if (motionInputState.value === 'requesting') {
    return gameText.value.motionRequesting
  }

  return motionInputError.value ?? gameText.value.motionDisabled
})
const debugTilt = computed(() => (
  tiltBeta.value === null && tiltGamma.value === null
    ? '—'
    : `${formatTilt(tiltGamma.value)} / ${formatTilt(tiltBeta.value)}`
))

const { startGameLoop, stopGameLoop } = useGameLoop((deltaTime) => {
  if (!context || canvasSize === 0) {
    return
  }

  if (gameState.value === 'playing') {
    playerPosition.value = updatePlayer(
      playerPosition.value,
      maze.value,
      { angularDirection: getPlayerAngularDirection(), radialFactor: getPlayerRadialFactor() },
      deltaTime,
    )

    if (hasPlayerWon(maze.value, playerPosition.value)) {
      finishGame()
    }
  }

  renderGame(context, canvasSize, maze.value, playerPosition.value)
})

function getPlayerAngularDirection() {
  const keyboardDirection = getKeyboardAngularDirection()

  if (keyboardDirection !== 0) {
    return keyboardDirection
  }

  return getMotionAngularDirection(playerPosition.value.angle)
}

function getPlayerRadialFactor() {
  if (isDebugHeartRate.value && isMotionInputActive.value) {
    return getMotionRadialFactor(playerPosition.value.angle) * DEBUG_MOTION_RADIAL_SENSITIVITY
  }

  return radialFactor.value
}

function formatTilt(value: number | null) {
  return value === null ? '—' : `${value.toFixed(1)}°`
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
    return position.radius < MAZE_CENTER_RADIUS ? gameText.value.centerArea : gameText.value.outerArea
  }

  return gameText.value.ringSector(ring + 1, getSectorForAngle(position.angle) + 1)
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
      <canvas ref="canvasElement" :aria-label="gameText.mazeCanvas" />
    </div>

    <aside v-if="isDebugHeartRate" class="debug-panel" :aria-label="gameText.debugPulseEmulator">
      <dl>
        <div>
          <dt>{{ gameText.baselineBpm }}</dt>
          <dd>{{ restingBpm ?? '—' }}</dd>
        </div>
        <div>
          <dt>{{ gameText.rawBpm }}</dt>
          <dd>{{ rawBpm }}</dd>
        </div>
        <div>
          <dt>{{ gameText.smoothedBpm }}</dt>
          <dd>{{ smoothedBpm.toFixed(1) }}</dd>
        </div>
        <div>
          <dt>{{ gameText.radius }}</dt>
          <dd>{{ playerPosition.radius.toFixed(1) }}</dd>
        </div>
        <div>
          <dt>{{ gameText.angle }}</dt>
          <dd>{{ playerPosition.angle.toFixed(2) }}</dd>
        </div>
        <div>
          <dt>{{ gameText.position }}</dt>
          <dd>{{ debugCell }}</dd>
        </div>
        <div>
          <dt>{{ gameText.gyro }}</dt>
          <dd>{{ debugMotionStatus }}</dd>
        </div>
        <div>
          <dt>{{ gameText.tilt }}</dt>
          <dd>{{ debugTilt }}</dd>
        </div>
      </dl>
      <button
        v-if="isMotionInputAvailable && !isMotionInputActive"
        type="button"
        :disabled="motionInputState === 'requesting'"
        @click="requestMotionInput"
      >
        {{ gameText.enableTilt }}
      </button>
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
  display: grid;
  gap: 0.5rem;
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

.debug-panel button {
  justify-self: start;
  border: 1px solid #111111;
  border-radius: 0;
  background: transparent;
  color: #111111;
  cursor: pointer;
  font: inherit;
  padding: 0.4rem 0.6rem;
}

.debug-panel button:disabled {
  cursor: default;
  opacity: 0.5;
}
</style>
