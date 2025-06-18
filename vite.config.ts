import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    hmr: {
      overlay: false,      // отключает ошибочный оверлей
      protocol: 'ws',      // стабильный протокол HMR
    },
    watch: {
      usePolling: true,    // устойчивость при нестабильной сети/вкладке
    },
  },
});
