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
      proxy: {
        '/v1': {
          target: 'https://cloud.appwrite.io',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/v1/, ''),
        },
      },
    },
    define: {
      'process.env': {
        ...env,
      },
    },
    build: {
      sourcemap: mode === 'development',
    },
  };
});
