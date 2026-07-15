import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const devCertificatePath = resolve('.certs/pulse-maze-dev.crt')
const devKeyPath = resolve('.certs/pulse-maze-dev.key')
const devHttps = (
  existsSync(devCertificatePath) && existsSync(devKeyPath)
    ? {
        cert: readFileSync(devCertificatePath),
        key: readFileSync(devKeyPath),
      }
    : undefined
)

export default defineConfig({
  plugins: [vue()],
  server: {
    https: devHttps,
  },
  ssgOptions: {
    dirStyle: 'nested',
    includedRoutes: () => ['/', '/en'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
