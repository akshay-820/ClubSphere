import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/colleges': 'http://localhost:3000',
      '/college-requests': 'http://localhost:3000',
      '/club-requests': 'http://localhost:3000',
      '/clubs': 'http://localhost:3000',
    },
  },
})
