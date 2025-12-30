import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.?(c|m)[jt]s?(x)'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['src/**/*.[jt]s?(x)'],
      exclude: ['src/__tests__', 'index.[jt]s?(x)']
    }
  }
});
