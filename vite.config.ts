import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.AIVES_API_PROXY_TARGET || 'http://localhost:8080'
  return {
  plugins: [react()],
  server: { proxy: { '/api': { target: proxyTarget, changeOrigin: true, secure: true } } },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' },
  }
})
