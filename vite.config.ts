import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // Only scan index.html for dependencies; ignore foreign html templates in taste-skill/
    entries: ['index.html'],
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        configure: (proxy) => {
          // Remove Vite's verbose default error logger to eliminate terminal ECONNREFUSED noise when running in client mode
          proxy.removeAllListeners('error');
          proxy.on('error', (_err, _req, res: any) => {
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ detail: 'Backend service offline. Running in direct client mode.' }));
            }
          });
        },
      },
    },
    watch: {
      ignored: ['**/taste-skill/**', '**/.taste-skill/**', '**/supabase/**'],
    },
  },
  build: {
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-gsap': ['gsap'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          // Split the 4 MB WFP dataset into its own lazy-loaded chunk
          'wfp-data': ['./src/lib/wfpMarketPrices'],
        },
      },
    },
  },
});
