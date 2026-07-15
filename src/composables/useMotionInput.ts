import { computed, ref } from 'vue'

import {
  getAngularDirectionFromTilt,
  getRadialFactorFromTilt,
} from '../game/player/motionControl'
import type { AngularDirection } from '../game/types'
import { getCurrentGameText } from './useGameTranslations'

type MotionInputState =
  | 'unsupported'
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const motionInputState = ref<MotionInputState>(getInitialMotionInputState())
const motionInputError = ref<string | null>(getInitialMotionInputError())
const tiltBeta = ref<number | null>(null)
const tiltGamma = ref<number | null>(null)

let isListening = false

/** Управляет угловым вводом с датчиков наклона смартфона. */
export function useMotionInput() {
  const isMotionInputAvailable = computed(() => motionInputState.value !== 'unsupported')
  const isMotionInputActive = computed(() => motionInputState.value === 'active')

  return {
    getAngularDirection,
    getRadialFactor,
    isMotionInputActive,
    isMotionInputAvailable,
    motionInputError,
    motionInputState,
    requestMotionInput,
    tiltBeta,
    tiltGamma,
  }
}

async function requestMotionInput() {
  const secureContextError = getSecureContextError()

  if (secureContextError) {
    motionInputState.value = 'unsupported'
    motionInputError.value = secureContextError
    return
  }

  const orientationConstructor = getDeviceOrientationConstructor()

  if (!orientationConstructor) {
    motionInputState.value = 'unsupported'
    motionInputError.value = getCurrentGameText().motionSensorUnavailable
    return
  }

  if (motionInputState.value === 'requesting' || motionInputState.value === 'active') {
    return
  }

  motionInputState.value = 'requesting'
  motionInputError.value = null

  try {
    const permission = await requestOrientationPermission(orientationConstructor)

    if (permission !== 'granted') {
      motionInputState.value = 'denied'
      motionInputError.value = getCurrentGameText().motionDenied
      return
    }

    startListening()
    motionInputState.value = 'active'
  } catch (error) {
    console.error(getCurrentGameText().motionEnableFailed, error)
    motionInputState.value = 'denied'
    motionInputError.value = getCurrentGameText().motionEnableFailed
  }
}

async function requestOrientationPermission(
  orientationConstructor: DeviceOrientationEventWithPermission,
) {
  if (typeof orientationConstructor.requestPermission !== 'function') {
    return 'granted'
  }

  return orientationConstructor.requestPermission()
}

function startListening() {
  if (isListening || typeof window === 'undefined') {
    return
  }

  window.addEventListener('deviceorientation', handleDeviceOrientation)
  window.addEventListener('blur', resetTilt)
  isListening = true
}

function handleDeviceOrientation(event: DeviceOrientationEvent) {
  tiltBeta.value = event.beta
  tiltGamma.value = event.gamma
}

function resetTilt() {
  tiltBeta.value = null
  tiltGamma.value = null
}

function getAngularDirection(playerAngle: number): AngularDirection {
  if (motionInputState.value !== 'active') {
    return 0
  }

  return getAngularDirectionFromTilt(tiltBeta.value, tiltGamma.value, playerAngle)
}

function getRadialFactor(playerAngle: number): number {
  if (motionInputState.value !== 'active') {
    return 0
  }

  return getRadialFactorFromTilt(tiltBeta.value, tiltGamma.value, playerAngle)
}

function getInitialMotionInputState(): MotionInputState {
  if (getSecureContextError()) {
    return 'unsupported'
  }

  return getDeviceOrientationConstructor() ? 'idle' : 'unsupported'
}

function getInitialMotionInputError(): string | null {
  const secureContextError = getSecureContextError()

  if (secureContextError) {
    return secureContextError
  }

  if (!getDeviceOrientationConstructor()) {
    return getCurrentGameText().motionSensorUnavailable
  }

  return null
}

function getSecureContextError(): string | null {
  if (typeof window === 'undefined' || window.isSecureContext) {
    return null
  }

  return getCurrentGameText().motionSecureContextRequired
}

function getDeviceOrientationConstructor(): DeviceOrientationEventWithPermission | null {
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
    return null
  }

  return window.DeviceOrientationEvent as DeviceOrientationEventWithPermission
}
