import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/react-transition-state/',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0
  }
});
