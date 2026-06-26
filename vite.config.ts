import { defineConfig, loadEnv } from 'vite'

import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load .env* from the project root (VITE_* and the proxy target).
  const env = loadEnv(mode, process.cwd(), '')

  const proxyTarget =
    env.VITE_API_PROXY_TARGET ?? 'https://sheetforge-backend-z4vy.onrender.com'

  return {
    plugins: [react(), TanStackRouterVite()],
    server: {
      port: 5173,
      open: true,
      // Dev only: forwards a relative `/api` base to Render server-side, so the
      // browser never makes a cross-origin call (no CORS). In prod (Vercel) this
      // proxy does not run — VITE_API_BASE_URL must be the full .../api URL there.
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
