import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const devBackendTarget = env.VITE_DEV_BACKEND_URL || "http://127.0.0.1:8000"

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      proxy: {
        "/api/v1": {
          target: devBackendTarget,
          changeOrigin: true,
        },
        "/media": {
          target: devBackendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
