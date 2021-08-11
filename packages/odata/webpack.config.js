const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
    globalObject: "(typeof self !== 'undefined' ? self: this)",
  },
  mode: 'none',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  externals: [
    {
      react: 'react',
      underscore: 'underscore',
      'query-string': 'query-string',
      '@microsoft/overreact': '@microsoft/overreact',
    },
  ],
};
