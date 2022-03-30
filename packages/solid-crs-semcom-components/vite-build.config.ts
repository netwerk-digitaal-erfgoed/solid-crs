import { resolve } from 'path';
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'lib',
  build: {
    target: 'es2015',
    lib: {
      entry: resolve(__dirname, 'index.html'),
      name: '@netwerk-digitaal-erfgoed/solid-crs-semcom-components'
    },
    rollupOptions: {
      input: {
        creation: resolve(__dirname, 'lib/object-creation.component.ts'),
        dimensions: resolve(__dirname, 'lib/object-dimensions.component.ts'),
        imagery: resolve(__dirname, 'lib/object-imagery.component.ts'),
        identification: resolve(__dirname, 'lib/object-identification.component.ts'),
        representation: resolve(__dirname, 'lib/object-representation.component.ts'),
        loan: resolve(__dirname, 'lib/object-loan.component.ts'),
      },
      output: [
        {
          entryFileNames: ({ facadeModuleId }) => facadeModuleId.split('/').pop().replace('.ts', '.js'),
          format: 'esm',
          dir: resolve(__dirname, 'dist')
        },
      ],
    },
    outDir: '../dist',
  },
});
