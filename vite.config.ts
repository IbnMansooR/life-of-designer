import { defineConfig } from 'vite'

// Vite konfiguratsiyasi.
// base: './'  -> Electron'da fayl:// orqali ochilganda yo'llar to'g'ri ishlashi uchun.
export default defineConfig({
  base: './',
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true
  }
})
