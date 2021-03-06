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
      bluebird: 'bluebird',
      'json-stable-stringify': 'json-stable-stringify',
      'prop-types': 'prop-types',
      react: 'react',
      'react-dom': 'react-dom',
      'regenerator-runtime': 'regenerator-runtime',
      underscore: 'underscore',
      uuid: 'uuid',
    },
  ],
};
