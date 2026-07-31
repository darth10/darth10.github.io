const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = 'production';

module.exports = [{
  mode: mode,
  entry: {
    'darth10.github.io': './darth10.github.io.js',
  },
  context: path.resolve(__dirname, 'src/js'),
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].min.js'
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
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/[name].css'
    }),
    new CopyPlugin({
      patterns: [
        { from: '*.min.js'}
      ]})
  ]}, {
    mode: mode,
    entry: {
      'lazy-sequences-and-streams': './lazy-sequences-and-streams.js',
      'linq-is-not-quick':          './linq-is-not-quick.js'
    },
    context: path.resolve(__dirname, 'src/js'),
    output: {
      path: path.resolve(__dirname, 'public/posts/'),
      filename: '[name]/post.min.js'
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
    }
  }];
