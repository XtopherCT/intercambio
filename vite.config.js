import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8098,
    proxy: {
      '/api': {
        target: 'http://application.canadacentral.cloudapp.azure.com:8099',
        changeOrigin: true
      }
    }
  }
})
