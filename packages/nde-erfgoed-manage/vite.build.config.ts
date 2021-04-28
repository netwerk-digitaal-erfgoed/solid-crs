import path from 'path';
import { defineConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  root: 'lib',
  build: {
      target: 'es2015',
      lib: {
          entry: path.resolve(__dirname, 'lib/index.ts'),
          name: '@digita-ai/nde-erfgoed-components'
      },
      outDir: '../dist',
      rollupOptions: {
        plugins: [
          nodePolyfills( 
            {
              crypto: true,
            }
           )
        ]
      },
  }
});