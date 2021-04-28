module.exports = {
    root: 'lib',
    packageOptions: {
        polyfillNode: true,
    },
    buildOptions: {
        out: "dist"
    },
    exclude: [
        '**/node_modules/**/*',
        '**/Dockerfile'
    ],
    // mount: {
    //     "dist": "/dist",
    // },
    optimize: {
        // entrypoints: ['lib/index.ts', 'lib/demo.ts', 'lib/collections/collection.component.ts', 'lib/collections/collections.component.ts'],
        entrypoints: 'auto',
        bundle: true,
        minify: true,
        target: 'es2015',
    },
    plugins: [
        '@snowpack/plugin-typescript',
    ]
};