import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Types and re-exports only: no logic executes, so there is nothing to cover.
      exclude: ['src/index.ts', 'src/http/transport.ts', 'src/api/content.ts', 'src/api/params.ts'],
      reporter: ['text', 'json-summary'],
      // A floor that catches regressions, not a target. Ratchets up, never down.
      thresholds: { statements: 95, branches: 90, functions: 95, lines: 95 },
    },
  },
});
