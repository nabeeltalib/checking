import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Resolves '@' to 'src' directory
      },
    },
    server: {
      port: 3000,
      proxy: {
        // Proxy configuration to handle Appwrite API requests
        '/v1': {
          target: 'https://cloud.appwrite.io', // Targeting Appwrite cloud
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/v1/, '/v1'), // Keeps '/v1' intact
        },
      },
    },
    define: {
      'process.env': {
        ...env, // Spread environment variables from .env files into process.env
      },
    },
    build: {
      sourcemap: mode === 'development', // Enables sourcemap for development builds
    },
  };
});