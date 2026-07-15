import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Return '/' for browser navigation requests (Accept: text/html) so Vite
// serves index.html for all SPA routes.  XHR / fetch API calls do NOT
// include text/html in Accept and will still be proxied to the backend.
function bypass(req) {
  const accept = req.headers.accept || ''
  if (accept.includes('text/html')) return '/'
  return null
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth':             { target: 'http://localhost:3000', changeOrigin: true, bypass },
      '/users':            { target: 'http://localhost:3000', changeOrigin: true, bypass },
      '/colleges':         { target: 'http://localhost:3000', changeOrigin: true, bypass },
      '/college-requests': { target: 'http://localhost:3000', changeOrigin: true, bypass },
      '/club-requests':    { target: 'http://localhost:3000', changeOrigin: true, bypass },
      '/clubs':            { target: 'http://localhost:3000', changeOrigin: true, bypass },
      '/payments':         { target: 'http://localhost:3000', changeOrigin: true, bypass },
      '/posts':            { target: 'http://localhost:3000', changeOrigin: true, bypass },
    },
  },
})
