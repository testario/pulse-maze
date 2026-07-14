interface Navigator {
  bluetooth?: Bluetooth
}

interface Bluetooth {
  requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>
}

interface BluetoothRequestDeviceOptions {
  filters?: BluetoothLEScanFilter[]
}

interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[]
}

interface BluetoothDevice extends EventTarget {
  gatt: BluetoothRemoteGATTServer | null
}

interface BluetoothRemoteGATTServer {
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value: DataView | null
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
}

type BluetoothServiceUUID = number | string
type BluetoothCharacteristicUUID = number | string
