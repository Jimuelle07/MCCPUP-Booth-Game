import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The /api proxy below is only used for local `npm run dev` outside Docker;
// inside Docker Compose, nginx (see frontend/nginx.conf) does this proxying.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
