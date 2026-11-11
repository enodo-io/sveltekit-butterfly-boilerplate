import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      'no-undef': 'off',
    },
  },
  {
    // Semantic HTML / SEO rules of the project (skills html-first, seo-links)
    files: ['**/*.svelte'],
    rules: {
      // every <button> says what it is (no implicit submit)
      'svelte/button-has-type': 'error',
      // target="_blank" always with rel (noopener)
      'svelte/no-target-blank': ['error', { allowReferrer: true }],
      'no-restricted-syntax': [
        'error',
        {
          // the anchor text is the SEO signal of a link: never a vague one
          selector:
            "SvelteElement[name.name='a'] > SvelteText[value=/^\\s*(read more|learn more|click here|here|more|lire la suite|en savoir plus|cliquez ici|ici|plus)\\s*\\.?\\s*$/i]",
          message: 'Vague anchor text: write what the target page is about (seo-links skill).',
        },
        {
          selector:
            "SvelteElement[name.name='a'] SvelteAttribute[key.name='href'] > SvelteLiteral[value=/^#?$/]",
          message: 'href="#" / empty href: use a <button> for an action, a real URL for a link.',
        },
      ],
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
);
