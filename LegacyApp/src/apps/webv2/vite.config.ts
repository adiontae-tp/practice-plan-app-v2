import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ppa/interfaces': path.resolve(__dirname, '../../packages/interfaces/src'),
      '@ppa/store': path.resolve(__dirname, '../../packages/store/src'),
      '@ppa/mock': path.resolve(__dirname, '../../packages/mock/src'),
      '@ppa/firebase': path.resolve(__dirname, '../../packages/firebase/src'),
      '@ppa/subscription': path.resolve(__dirname, '../../packages/subscription/src'),
      '@ppa/ui': path.resolve(__dirname, '../../ui'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
