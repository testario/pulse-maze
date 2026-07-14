import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { AngularDirection } from '../game/types'

const CONTROLLED_KEYS = new Set(['ArrowLeft', 'ArrowRight'])

/** Отслеживает нажатые клавиши управления угловым движением игрока. */
export function useKeyboardInput() {
  const isLeftPressed = ref(false)
  const isRightPressed = ref(false)

  function setKeyState(key: string, isPressed: boolean) {
    if (key === 'ArrowLeft') {
      isLeftPressed.value = isPressed
    }

    if (key === 'ArrowRight') {
      isRightPressed.value = isPressed
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!CONTROLLED_KEYS.has(event.key)) {
      return
    }

    event.preventDefault()
    setKeyState(event.key, true)
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (!CONTROLLED_KEYS.has(event.key)) {
      return
    }

    event.preventDefault()
    setKeyState(event.key, false)
  }

  function resetInput() {
    isLeftPressed.value = false
    isRightPressed.value = false
  }

  function getAngularDirection(): AngularDirection {
    if (isLeftPressed.value === isRightPressed.value) {
      return 0
    }

    return isLeftPressed.value ? -1 : 1
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', resetInput)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', resetInput)
  })

  return {
    getAngularDirection,
  }
}
