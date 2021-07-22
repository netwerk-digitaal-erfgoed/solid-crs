import { defineConfig, loadEnv } from 'vite';
import path from 'path';


export default defineConfig( ({ command, mode }) => {
  if (command === 'serve') {
    return {
      root: 'lib',
      build: {
          target: 'es2015',
          outDir: '../dist'
      },
      server: {
        port: 3001,
      }
    }
  } else if (command === 'build'){
    return {
      root: 'lib',
      build: {
          target: 'es2015',
          lib: {
              entry: path.resolve(__dirname, 'lib/index.ts'),
              name: '@netwerk-digitaal-erfgoed/solid-crs-components'
          },
          outDir: '../dist'
      }
    }
  }
});
