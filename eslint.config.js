import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },

  js.configs.recommended,

  // Type-aware linting covers the TypeScript program only. This config file is
  // not part of it, so the typed rules must not be applied globally.
  {
    files: ['**/*.ts'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      // A library must not write to its consumer's stdout; errors are thrown.
      'no-console': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // The name is the documentation, at the point of use. No exception list,
      // deliberately - that is where this kind of rule dies.
      'id-length': ['error', { min: 2 }],
    },
  },

  {
    // Test APIs are untyped by nature: `response.json()` is `any`, and fake
    // implementations satisfy async interfaces without awaiting anything.
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
);
