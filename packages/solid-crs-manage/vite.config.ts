import { defineConfig, loadEnv } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';

export default defineConfig( ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());

  // expose .env as process.env instead of import.meta since jest does not import meta yet
  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => {
      return {
        ...prev,
        ['process.env.' + key]: `"${val}"`,
        ['process.env.DEV']: `"${command === 'serve'}"`,
        ['process.env.PROD']: `"${command === 'build'}"`,
        ['process.env.MODE']: command === 'build' ? `"PROD"` : `"DEV"`,
        ['process.env.PRESENTATION']: command === 'build'
          ? `"https://solid-crs-presentatie.netwerkdigitaalerfgoed.nl/"`
          : `"http://localhost:3005/"`,
      }
    },
    {},
  );

  if (command === 'serve') {
      return {
        // fixes 404 errors with dots in URL when serving locally (https://github.com/vitejs/vite/issues/2415)
        plugins: [ pluginRewriteAll() ],
        root: 'lib',
        server: {
          port: 3002,
        },
        mode: 'development',
        define: envWithProcessPrefix,
      }
  } else if (command === 'build'){
    return {
        root: 'lib',
        build: {
            target: 'es2015',
            outDir: '../dist',
        },
        server: {
          port: 3002,
        },
        mode: 'production',
        define: envWithProcessPrefix,
      }
  }
});
