import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintPluginEslintComments from 'eslint-plugin-eslint-comments';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.storybook/**',
      'stories/**',
      'readme/**',
      '.next/**',
      '.yarn/**',
      'apps/next-app/.next/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        jsxPragma: null,
      },
    },
    plugins: {
      react: eslintPluginReact,
      import: eslintPluginImport,
      prettier: eslintPluginPrettier,
      '@typescript-eslint': typescriptEslintPlugin,
      'eslint-comments': eslintPluginEslintComments,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme'], location: 'start' }],
      'no-inline-comments': 'warn',
      'spaced-comment': ['warn', 'never'],
      'eslint-comments/no-unused-disable': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
