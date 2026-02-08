import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/events': 'http://localhost:3001',
      '/api/admin': 'http://localhost:3001',
      '/api/registrations': 'http://localhost:3001',
    }
  }
})
