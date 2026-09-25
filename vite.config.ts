import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Local dev: forward /api to the PHP backend (php -S localhost:8080).
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
