import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

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
      // Expose all env variables to the client side
      'process.env': env
    },
    build: {
      sourcemap: mode === 'development',
    },
    // Add environment directory and prefix
    envDir: '.',
    envPrefix: 'VITE_',
  };
});