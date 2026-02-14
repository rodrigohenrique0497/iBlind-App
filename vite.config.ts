
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.js',
      injectManifest: {
        // O Workbox injetará o manifesto aqui. 
        // Não definimos swSrc/swDest aqui para evitar conflitos com srcDir/filename.
        injectionPoint: 'self.__WB_MANIFEST',
        maximumFileSizeToCacheInBytes: 3000000 // 3MB
      },
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false, // Usando o manifest.json manual da pasta public
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@supabase/supabase-js']
        }
      }
    }
  }
})
