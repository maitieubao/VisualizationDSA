import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true,
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['*.wasm'],
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Monaco Editor — largest single chunk, must be isolated first
          if (id.includes('monaco-editor')) {
            return 'monaco-vendor';
          }
          // Vue core ecosystem — Vue, Pinia, Vue-Router
          if (
            id.includes('/node_modules/vue/') ||
            id.includes('/node_modules/@vue/') ||
            id.includes('/node_modules/pinia') ||
            id.includes('/node_modules/vue-router')
          ) {
            return 'vue-core';
          }
          // SignalR
          if (id.includes('@microsoft/signalr')) {
            return 'signalr-vendor';
          }
          // XLSX / ExcelJS
          if (id.includes('xlsx') || id.includes('exceljs')) {
            return 'xlsx-vendor';
          }
          // Everything else goes into vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});

