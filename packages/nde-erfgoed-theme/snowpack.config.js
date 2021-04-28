module.exports = {
    root: 'lib',
    packageOptions: {
        polyfillNode: true,
    },
    buildOptions: {
        out: "dist",
    },
    exclude: [
        '**/node_modules/**/*',
        '**/Dockerfile'
    ],
    optimize: {
        // entrypoints: ['lib/index.ts'],
        entrypoints: 'auto',
        bundle: true,
        // minify: true,
    },
    plugins: [
        '@snowpack/plugin-typescript',
        ["@snowpack/plugin-build-script", {"cmd": "postcss", "input": [".css"], "output": [".css"]}],
        ["snowpack-plugin-raw-file-loader", {
            exts: [".svg"],
        }],
    ]
};