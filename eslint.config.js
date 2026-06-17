//  @ts-check

import js from '@eslint/js'
import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    'eslint.config.js',
    'prettier.config.js',
    'stylelint.config.js',
    'routeTree.gen.ts',
  ]),
  {
    name: 'app/base',
    extends: [
      tanstackConfig,
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
    ],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'import/no-cycle': 'off',
      'import/order': 'off',
      'import/consistent-type-specifier-style': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    name: 'app/routes',
    files: ['src/routes/**/*.{ts,tsx}', 'src/routeTree.gen.ts'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
