import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: './', // Assets are loaded relative to index.html
    plugins: [react()],
    // GEMINI_API_KEY is intentionally NOT exposed to the browser anymore.
    // All Gemini calls go through Convex actions (see convex/gemini.ts).
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      host: true,
      port: 3000,
    },
  };
});
