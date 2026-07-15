import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  ssgOptions: {
    dirStyle: 'nested',
    includedRoutes: () => ['/', '/en'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
