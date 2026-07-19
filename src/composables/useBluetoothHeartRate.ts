import { ref } from 'vue'

import {
  parseHeartRateMeasurement,
  smoothBpm,
} from '../game/heartRate'
import { getCurrentGameText } from './useGameTranslations'

const HEART_RATE_SERVICE_UUID = 0x180d
const HEART_RATE_MEASUREMENT_UUID = 0x2a37

export type BluetoothConnectionState =
  | 'unsupported'
  | 'disconnected'
  | 'connecting'
  | 'connected'

const connectionState = ref<BluetoothConnectionState>(getBluetooth() ? 'disconnected' : 'unsupported')
const connectionError = ref<string | null>(null)
const rawBpm = ref<number | null>(null)
const smoothedBpm = ref<number | null>(null)
const lastMeasurementAt = ref<number | null>(null)

let device: BluetoothDevice | null = null
let heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

/** Предоставляет общее состояние Bluetooth-пульсометра для интерфейса и игры. */
export function useBluetoothHeartRate() {
  return {
    connectHeartRateMonitor,
    connectionError,
    connectionState,
    lastMeasurementAt,
    rawBpm,
    smoothedBpm,
  }
}

/** Запрашивает и подключает пульсометр; функцию следует вызывать только по действию пользователя. */
async function connectHeartRateMonitor() {
  const bluetooth = getBluetooth()

  if (!bluetooth) {
    connectionState.value = 'unsupported'
    connectionError.value = getCurrentGameText().bluetoothUnavailable
    return
  }

  if (connectionState.value === 'connecting') {
    return
  }

  clearConnection(true)
  connectionError.value = null
  connectionState.value = 'connecting'

  try {
    const selectedDevice = await bluetooth.requestDevice({
      filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
    })

    device = selectedDevice
    device.addEventListener('gattserverdisconnected', handleGattDisconnected)

    const gatt = selectedDevice.gatt

    if (!gatt) {
      throw new Error(getCurrentGameText().bluetoothNoGatt)
    }

    const server = await gatt.connect()
    const service = await server.getPrimaryService(HEART_RATE_SERVICE_UUID)
    const characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_UUID)

    heartRateCharacteristic = characteristic
    characteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement)
    await characteristic.startNotifications()

    connectionState.value = 'connected'
  } catch (error) {
    clearConnection(true)
    connectionState.value = 'disconnected'

    if (isDeviceSelectionCancelled(error)) {
      connectionError.value = getCurrentGameText().bluetoothSelectionCancelled
      return
    }

    console.error(getCurrentGameText().bluetoothConnectFailed, error)
    connectionError.value = getCurrentGameText().bluetoothConnectFailed
  }
}

function handleHeartRateMeasurement() {
  const value = heartRateCharacteristic?.value
  const bpm = value ? parseHeartRateMeasurement(value) : null

  if (bpm === null) {
    console.error(getCurrentGameText().bluetoothInvalidData)
    return
  }

  rawBpm.value = bpm
  smoothedBpm.value = smoothedBpm.value === null ? bpm : smoothBpm(smoothedBpm.value, bpm)
  lastMeasurementAt.value = performance.now()
}

function handleGattDisconnected() {
  clearConnection(false)
  connectionState.value = 'disconnected'
  connectionError.value = getCurrentGameText().bluetoothConnectionLost
}

function clearConnection(disconnectGatt: boolean) {
  heartRateCharacteristic?.removeEventListener('characteristicvaluechanged', handleHeartRateMeasurement)
  heartRateCharacteristic = null

  if (device) {
    device.removeEventListener('gattserverdisconnected', handleGattDisconnected)

    if (disconnectGatt && device.gatt?.connected) {
      device.gatt.disconnect()
    }
  }

  device = null
  rawBpm.value = null
  smoothedBpm.value = null
  lastMeasurementAt.value = null
}

function getBluetooth(): Bluetooth | null {
  if (typeof navigator === 'undefined') {
    return null
  }

  return navigator.bluetooth ?? null
}

function isDeviceSelectionCancelled(error: unknown): boolean {
  return error instanceof Error && error.name === 'NotFoundError'
}
