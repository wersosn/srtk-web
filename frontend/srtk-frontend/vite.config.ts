import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5048',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/common',
      '@fullcalendar/core',
      '@fullcalendar/interaction',
      '@fullcalendar/timegrid',
    ],
  },
});
