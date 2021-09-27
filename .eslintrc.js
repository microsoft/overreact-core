module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  extends: [
    'react-app',
    'react-app/jest',
    'airbnb',
  ],
  plugins: [
    'react',
    'react-hooks',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  rules: {
    // https://github.com/facebook/react/tree/master/packages/eslint-plugin-react-hooks
    // Let's play by the Rules of Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'linebreak-style': 0,
    'import/prefer-default-export': 0,
    'no-underscore-dangle': 0,
    'no-prototype-builtins': 0,
    'react/jsx-filename-extension': ['error', {
      extensions: ['.js'],
    }],
    'arrow-parens': ['error', 'as-needed'],
  },
};
