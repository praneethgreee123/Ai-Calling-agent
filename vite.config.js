import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to the external network (crucial for Pelican)
    port: 25501,
    allowedHosts: ['frontend.familyoffade.me'],
    proxy: {
      // Whenever your frontend makes a request to '/api', 
      // Vite will forward it to your backend.
      '/api': {
        target: 'https://srt.familyoffade.me',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 25501,
    allowedHosts: ['frontend.familyoffade.me'],
  }
});
