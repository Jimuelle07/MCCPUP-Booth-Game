import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The /api proxy below is only used for local `npm run dev` outside Docker;
// inside Docker Compose, nginx (see frontend/nginx.conf) does this proxying.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
