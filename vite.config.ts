import { defineConfig,loadEnv } from 'vite'

import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'
export default defineConfig(({mode})=>{
  const env = loadEnv(mode,"env");


  return {
        plugins: [react(),TanStackRouterVite()],
        server: {
          port: 5173,
          open: true,
        },
        resolve:{
          alias:{
            '@': path.resolve(__dirname, './src'),
          }
        }
        }
},)
