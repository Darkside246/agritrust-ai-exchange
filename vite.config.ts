import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Node-only packages that must never enter the browser bundle.
// Adding them here prevents Vite/Rollup from attempting to resolve
// their transitive Node built-in imports (fs, path, child_process, etc.)
const SERVER_ONLY_EXTERNALS = [
  'whatsapp-web.js',
  'puppeteer',
  'puppeteer-core',
  '@puppeteer/browsers',
  'better-sqlite3',
  '@anthropic-ai/sdk',
  'qrcode',
  'escalade',
  'yargs',
  'archiver',
  'get-uri',
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: SERVER_ONLY_EXTERNALS,
    },
  },
  optimizeDeps: {
    exclude: SERVER_ONLY_EXTERNALS,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
