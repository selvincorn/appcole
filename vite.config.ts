import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core separado para mejor caché del navegador
          'vendor-react': ['react', 'react-dom'],
          // Supabase en chunk aparte (librería grande)
          'vendor-supabase': ['@supabase/supabase-js'],
          // Íconos de Lucide
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
