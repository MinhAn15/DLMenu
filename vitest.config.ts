import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dilinh/types': path.resolve(__dirname, './packages/types/src'),
      '@dilinh/validation': path.resolve(__dirname, './packages/validation/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['packages/**', 'node_modules/**'],
  },
});
