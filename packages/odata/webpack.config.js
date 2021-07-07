const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    globalObject: 'this',
    library: {
      name: '@microsoft/overreact-odata',
      type: 'umd',
    },
  },
  devtool: 'source-map',
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
      'json-stable-stringify': 'json-stable-stringify',
      'prop-types': 'prop-types',
      react: 'react',
      'react-dom': 'react-dom',
      'regenerator-runtime': 'regenerator-runtime',
      uuid: 'uuid',
    },
  ],
};
