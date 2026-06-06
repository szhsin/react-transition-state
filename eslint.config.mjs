// @ts-check
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import vitest from '@vitest/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactHooksAddons from 'eslint-plugin-react-hooks-addons';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  vitest.configs.recommended,
  reactHooksAddons.configs.recommended,
  prettier,
  {
    files: ['**/*.?(c|m)js'],
    ...tseslint.configs.disableTypeChecked
  },
  {
    ignores: ['**/coverage/', '**/dist/', '**/types/', '**/build/']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.?(c|m)[jt]s', 'website/*.?(c|m)js']
        },
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest
      }
    },
    plugins: {
      // @ts-ignore
      'react-hooks': reactHooks
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_\\d?$' }],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ]
    }
  },
  {
    files: ['website/**/*'],
    rules: {
      'no-console': 0
    }
  }
);
