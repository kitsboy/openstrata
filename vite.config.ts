import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const isVitest = process.env.VITEST === 'true';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // Vite only inlines `import.meta.env.*` for its own prefix, which defaults to
  // `VITE_` alone. `PUBLIC_` is the documented frontend wiring
  // (PUBLIC_API_BASE_URL, see .env.example), so without this line that variable
  // compiles to `undefined` in the bundle and a build can only reach a host
  // through the runtime `openstrata-api-base` override. src/lib/api/config.ts
  // is what reads it; src/lib/api/config.test.ts fails if this line goes away.
  envPrefix: ['PUBLIC_', 'VITE_'],
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
