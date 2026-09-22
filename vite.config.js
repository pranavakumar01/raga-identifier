import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // localhost is a secure context, so getUserMedia works without HTTPS certs.
    host: 'localhost',
    port: 5173,
    open: true,
  },
});
