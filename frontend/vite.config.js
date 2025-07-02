import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "IE 11"], // Поддержка старых браузеров
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"]
    }),
     VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg', 
        'favicon.ico', 
        'robots.txt', 
        'apple-touch-icon.png', 
        'eye-512.png', 
        'eye-192.png'
      ],
      manifest: {
        name: 'SMOTRELKA',
        short_name: 'SMOTRELKA',
        start_url: '/home',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3367D6',
        icons: [
          {
            src: '/eye-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/eye-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      }
    })
  ],
  build: {
    minify: "terser", // Минификация для уменьшения размера
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Разбиваем зависимости в отдельный файл
          }
        },
      },
    },
    chunkSizeWarningLimit: 800, // Поднимаем лимит для предупреждений (если хочешь)
  },
  css: {
    postcss: "./postcss.config.js",
  },
});