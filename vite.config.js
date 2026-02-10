import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api/auth': 'http://localhost:3001',
      '/api/events': 'http://localhost:3001',
      '/api/admin': 'http://localhost:3001',
      '/api/registrations': 'http://localhost:3001',
    }
  }
})
