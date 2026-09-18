/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { cardsApiPlugin } from './src/server/devPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.POKEMONTCG_API_KEY || process.env.POKEMONTCG_API_KEY || '';

  return {
    plugins: [react(), cardsApiPlugin(apiKey)],
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
    server: {
      host: true,
      port: 5173,
    },
    preview: {
      host: true,
      port: 4173,
    },
  };
});
