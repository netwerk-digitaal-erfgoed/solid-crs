module.exports = {
    root: 'lib',
    packageOptions: {
        polyfillNode: true,
    },
    buildOptions: {
        out: "dist/bundles"
    },
    exclude: [
        '**/node_modules/**/*',
        '**/Dockerfile'
    ],
    optimize: {
        entrypoints: ['lib/index.ts'],
        bundle: true,
        minify: true,
        target: 'es2015',
    },
    plugins: [
        '@snowpack/plugin-typescript',
    ]
};