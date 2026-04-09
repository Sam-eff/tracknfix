import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const devBackendTarget = process.env.VITE_DEV_BACKEND_URL || "http://127.0.0.1:8000"

// https://vite.dev/config/
export default defineConfig({
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined
          }

          if (id.includes("recharts")) {
            return "vendor-charts"
          }

          if (id.includes("@sentry")) {
            return "vendor-sentry"
          }

          if (id.includes("react")) {
            return "vendor-react"
          }

          return "vendor"
        },
      },
    },
  },
})
