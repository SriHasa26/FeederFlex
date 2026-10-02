import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // A pre-existing, unrelated dev server on this machine occupies the Vite default (5173) --
    // using a distinct, explicit port here avoids silently colliding with it.
    port: 5199,
    strictPort: true,
  },
})
