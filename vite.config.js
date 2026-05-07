import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/Linkup-/',
  build: {
    minify: false,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 4000,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'LinkUp',
        short_name: 'LinkUp',
        description: 'تطبيق مكالمات صوت وفيديو',
        theme_color: '#1e293b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/Linkup-/',
        scope: '/Linkup-/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/Linkup-/index.html',
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { host: true, port: 5173 },
})