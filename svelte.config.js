import * as child_process from 'node:child_process';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      precompress: true,
      polyfill: true,
      out: 'build',
    }),
    alias: {
      $components: './src/components',
      $directives: './src/directives',
      $assets: './src/assets',
    },
    version: {
      name:
        `${process.env['npm_package_name']}@${process.env['npm_package_version']}+` +
        child_process.execSync('git rev-parse --short HEAD').toString().trim(),
    },
  },
};

export default config;
