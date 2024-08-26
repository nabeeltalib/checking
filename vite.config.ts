import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    },
    define: {
      'process.env': env, // Optional: Spreading loaded env variables to process.env
    },
    build: {
      sourcemap: mode === 'development', // Optional: Sourcemap for dev mode
    },
  };
});
