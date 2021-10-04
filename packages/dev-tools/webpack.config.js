const path = require('path');

module.exports = {
  entry: {
    ui: './src/ui/index.js',
    agent: './src/agent/index.js',
  },

  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, 'src/extension/dist/'),
    chunkFilename: '[id].js',
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          // [style-loader](/loaders/style-loader)
          { loader: 'style-loader' },
          // [css-loader](/loaders/css-loader)
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          // [sass-loader](/loaders/sass-loader)
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
};
