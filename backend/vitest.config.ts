import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    // Integration tests share an in-memory rate-limiter and module mocks;
    // run files sequentially so they don't interfere with one another.
    fileParallelism: false,
  },
});
