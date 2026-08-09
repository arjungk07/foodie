import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages: deployed at https://arjungk07.github.io/foodie/
  base: '/foodie/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
    '/api': 'http://localhost:5000'
  }
  }
});
