import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/", // 🔹 Ensures correct relative paths for Netlify
  plugins: [react()],
});
