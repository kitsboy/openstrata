import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const isVitest = process.env.VITEST === 'true';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // Only under vitest: force Svelte 5 to resolve to its client build so
  // @testing-library/svelte can mount components. Vite dev/build are unaffected.
  resolve: isVitest
    ? { conditions: ['browser', 'development|production', 'module', 'import'] }
    : undefined,
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts']
  }
});
