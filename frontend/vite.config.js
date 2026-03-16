import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // simple-peer dùng CommonJS, cần pre-bundle để Vite xử lý đúng
    include: ['simple-peer'],
  },
  define: {
    // simple-peer dùng global.process và global.Buffer (Node.js env)
    global: 'globalThis',
  },
})
