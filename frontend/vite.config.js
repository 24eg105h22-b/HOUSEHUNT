import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = process.env.BACKEND_URL || process.env.VITE_API_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND.replace(/\/api\/?$/, ''),
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/uploads': {
        target: BACKEND.replace(/\/api\/?$/, ''),
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
