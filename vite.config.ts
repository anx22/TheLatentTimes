import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the @google/genai SDK which strictly requires it
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      // Map other vars to process.env to maintain consistency with the codebase
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    }
  };
});