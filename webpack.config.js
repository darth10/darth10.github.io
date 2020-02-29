const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const mode = 'production';

module.exports = [{
  mode: mode,
  entry: './darth10.github.io.js',
  context: path.resolve(__dirname, 'src/js'),
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: "darth10.github.io.min.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin([{
      from: '*.min.js'
    }])
  ]
}];
