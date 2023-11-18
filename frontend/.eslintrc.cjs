module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'capitalized-comments': [1, 'always'],
    'dot-notation': 1,
    'prefer-destructuring': ['error', { 'object': true, 'array': false }],
    'quotes': ['error', 'single'],
    'sort-imports': 1,
    'jsx-quotes': ['error', 'prefer-double'],
    'react/prop-types': 'off',
    'react/jsx-sort-props': 1,
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    'react/destructuring-assignment': 1,
    'react/no-deprecated': 2,
    'react-hooks/exhaustive-deps': 'off',
  },
}
