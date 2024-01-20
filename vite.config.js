import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  build: {
    minify: true, // Disable minification
    rollupOptions: {
      treeshake: false // Disable tree shaking
    }
  }
})