import { defineConfig } from 'vite'

export default defineConfig({
  root: 'lib',
  build: {
      target: 'es2015',
      outDir: '../dist'
  },
  server: {
    port: 3001,
  }
});
