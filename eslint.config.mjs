import js from '@eslint/js';
import globals from 'globals';

const unused = { vars: 'all', args: 'all', argsIgnorePattern: '^_', caughtErrors: 'none' };
const firstParty = ['screen.js', 'src/**/*.js', 'scripts/**/*.mjs', 'tests/**/*.mjs', 'eslint.config.mjs'];

export default [
  { ignores: ['scripts/vendor/**', 'vendor/**', 'static/**', 'assets/**', '.claude/**'] },
  {
    files: firstParty,
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', unused],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  { files: ['src/shell/**/*.js', 'screen.js'], languageOptions: { globals: globals.browser } },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['tests/helpers/core-runner.mjs', 'tests/helpers/lifecycle.mjs', 'tests/helpers/renderer-integration.mjs'],
    languageOptions: { globals: { window: 'readonly', document: 'readonly' } },
  },
  {
    files: ['screen.js'],
    languageOptions: { globals: { VirtuosoLabWebAudioFontPlayer: 'readonly' } },
    // Legacy findings are visible and ratcheted by scripts/lint.mjs, not silently disabled.
    rules: {
      'no-dupe-keys': 'warn',
      'no-control-regex': 'warn',
    },
  },
];
