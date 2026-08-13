const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = 'production';

// Each script in src/js/posts is built into public/posts/<entry name>/post.min.js,
// so a script's filename must match the slug of the post that loads it.
const postsContext = path.resolve(__dirname, 'src/js/posts');
const postEntries = Object.fromEntries(
  fs.readdirSync(postsContext)
    .filter((file) => file.endsWith('.js'))
    .map((file) => [path.basename(file, '.js'), './' + file])
);

// highlight.js ships no license header in the sources we import, so its
// BSD-3-Clause notice has to be added explicitly. BannerPlugin emits it as a
// /*! comment, which Terser then extracts into the .LICENSE.txt sidecar.
const hljsDir = path.resolve(__dirname, 'node_modules/highlight.js');
const hljsBanner = [
  `highlight.js ${require(path.join(hljsDir, 'package.json')).version}`,
  '',
  fs.readFileSync(path.join(hljsDir, 'LICENSE'), 'utf8').trim()
].join('\n');

module.exports = [{
  mode: mode,
  entry: {
    'darth10.github.io': './darth10.github.io.js',
  },
  context: path.resolve(__dirname, 'src/js'),
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'js/[name].min.js'
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
          {
            loader: 'css-loader',
            options: {
              // Fonts are copied to public/fonts and served from the site
              // root, so leave root-absolute url() references untouched.
              url: { filter: (url) => !url.startsWith('/') }
            }
          },
          'sass-loader'
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new webpack.BannerPlugin({
      banner: hljsBanner,
      raw: false,
      entryOnly: true
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/@fontsource/alegreya-sans/files/alegreya-sans-latin-{400,500,700}-normal.woff2'),
          to: 'fonts/[name][ext]'
        },
        {
          from: path.resolve(__dirname, 'node_modules/@fontsource/cascadia-code/files/cascadia-code-latin-{400,700}-normal.woff2'),
          to: 'fonts/[name][ext]'
        }
      ]})
  ]}, {
    mode: mode,
    entry: postEntries,
    context: postsContext,
    output: {
      path: path.resolve(__dirname, 'public/posts/'),
      filename: '[name]/post.min.js'
    },
    optimization: {
      minimizer: [new TerserPlugin({
        extractComments: /license|copyright/i
      })]
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
