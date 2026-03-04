import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    include: ['src/**/tests/**/*.test.ts', 'src/**/tests/**/*.test.tsx'],
  },
});
