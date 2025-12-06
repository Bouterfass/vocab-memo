import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          // ton popup React
          popup: path.resolve(__dirname, 'index.html'),
          // ton service worker MV3
          background: path.resolve(__dirname, 'background.ts'),
        },
        output: {
          entryFileNames: (chunk) => {
            if (chunk.name === 'background') {
              // Chrome attend exactement "background.js"
              return 'background.js';
            }
            // le reste (React, etc.)
            return 'assets/[name]-[hash].js';
          },
        },
      },
    },
  };
});
