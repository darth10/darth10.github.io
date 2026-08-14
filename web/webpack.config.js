const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
  hljsBanner,
  fontLicense,
  thirdPartyNotices,
  EmitNoticesPlugin
} = require('./build/licenses');

const mode = 'production';

// Each script in web/js/posts is built into public/posts/<entry name>/post.min.js,
// so a script's filename must match the slug of the post that loads it.
const postsContext = path.resolve(__dirname, 'js/posts');
const postEntries = Object.fromEntries(
  fs.readdirSync(postsContext)
    .filter((file) => file.endsWith('.js'))
    .map((file) => [path.basename(file, '.js'), './' + file])
);

const babelRule = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env']
    }
  }
};

module.exports = [
  {
    mode: mode,
    entry: {
      'darth10.github.io': './darth10.github.io.js',
    },
    context: path.resolve(__dirname, 'js'),
    output: {
      path: path.resolve(__dirname, '../public'),
      filename: 'js/[name].min.js'
    },
    module: {
      rules: [
        babelRule,
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
        entryOnly: true,
        test: /\.js$/
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
        ]
      }),
      new EmitNoticesPlugin({
        'THIRD-PARTY-NOTICES.txt': thirdPartyNotices,
        'fonts/LICENSE.txt': fontLicense
      })
    ]
  },
  {
    mode: mode,
    entry: postEntries,
    context: postsContext,
    output: {
      path: path.resolve(__dirname, '../public/posts/'),
      filename: '[name]/post.min.js'
    },
    optimization: {
      minimizer: [new TerserPlugin({
        extractComments: /license|copyright/i
      })]
    },
    module: {
      rules: [babelRule]
    }
  }
];
