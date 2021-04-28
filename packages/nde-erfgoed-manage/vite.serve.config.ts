import { defineConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  root: 'lib',
  // define: {
  //   global: 'globalThis'
  // },
  build: {
      target: 'es2015',
      outDir: '../dist',
      rollupOptions: {
        plugins: [
          nodePolyfills( 
            {
              crypto: true,
            }
          ),
        ]
      }
  }
});