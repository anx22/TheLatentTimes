
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  console.log("VITE CONFIG ENV KEYS:", Object.keys(env).filter(k => k.includes('API_KEY') || k.includes('GEMINI')));

  return {
    base: './', // CRITICAL: Ensures assets are loaded relative to index.html
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.API_KEY || env.VITE_GEMINI_API_KEY || ''),
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      host: true,
      port: 3000,
    }
  };
});
