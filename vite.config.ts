import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'serve'
    ? '/'
    : (process.env.VERCEL ? '/' : (process.env.VITE_BASE_PATH || '/social-app/')),
}));
