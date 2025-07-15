module.exports = {
  'parser': '@typescript-eslint/parser',
  'extends': ['eslint:recommended', 'prettier'],
  'plugins': ['@typescript-eslint', 'prettier', 'import'],
  'parserOptions': {
    'ecmaVersion': 2022,
    'sourceType': 'module',
  },
  'env': {
    'node': true,
    'es2022': true,
  },
  'globals': {
    'Bun': 'readonly',
  },
  'rules': {
    'prettier/prettier': ['error', {}, { 'usePrettierrc': true }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'quote-props': ['error', 'always'],

    // Import formatting rules
    'import/order': [
      'error',
      {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true,
        },
      },
    ],
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
  },
  'ignorePatterns': ['dist/', 'node_modules/', '*.js', '*.cjs'],
};
