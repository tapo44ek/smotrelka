import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "IE 11"], // Поддержка старых браузеров
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"]
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