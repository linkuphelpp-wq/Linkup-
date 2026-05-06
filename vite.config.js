import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  build: {
    minify: false,
    sourcemap: false,
    reportCompressedSize: false, // يمنع حساب gzip الذي يسبب الانهيار
    chunkSizeWarningLimit: 4000,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // تبسيط إعدادات PWA لتخفيف المعالجة
      workbox: {
        globPatterns: [], // لا حاجة لمسح الملفات الآن
      },
      manifest: {
        name: 'LinkUp',
        short_name: 'LinkUp',
        theme_color: '#1e293b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [] // سنضيف الأيقونات يدوياً إذا نجح البناء
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { host: true, port: 5173 },
})