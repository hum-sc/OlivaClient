import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    injectRegister: false,
    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Oliva: Tus notas perfectamente estructuradas.',
      short_name: 'Oliva',
      description: 'Editor de notas Cornell para STEM',
      theme_color: '#ffffff',
      orientation: 'landscape',
    },

    injectManifest: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      maximumFileSizeToCacheInBytes: 5000000
    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})