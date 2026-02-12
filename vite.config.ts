
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    base: './', // CRITICAL: Ensures assets are loaded relative to index.html
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      host: true,
      port: 5173,
    }
  };
});
