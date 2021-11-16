/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file webpack.config.js
 * @author clark-t
 */

const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const { SanLoaderPlugin } = require('san-loader');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.san$/,
        use: [
          {
            loader: require.resolve('san-hot-loader'),
          },
          {
            loader: 'san-loader'
          },
        ],
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                require.resolve('@babel/plugin-proposal-class-properties'),
                require.resolve('san-hot-loader/lib/babel-plugin'),
              ],
              presets: [
                [
                  require.resolve('@babel/preset-env'),
                  {
                    targets: {
                      browsers: '> 1%, last 2 versions',
                    },
                    modules: false,
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                require.resolve('@babel/plugin-proposal-class-properties'),
                require.resolve('san-hot-loader/lib/babel-plugin'),
              ],
              presets: [
                [
                  require.resolve('@babel/preset-env'),
                  {
                    targets: {
                      browsers: '> 1%, last 2 versions',
                    },
                    modules: false,
                  },
                ],
                [
                  require.resolve('@babel/preset-typescript'),
                  { allExtensions: true },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]_[hash:base64:5]',
                  },
                  localsConvention: 'camelCase',
                  sourceMap: true,
                },
              },
              {
                loader: 'less-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
          // 这里匹配 `<style lang="less">`
          {
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'less-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.css$/,
        oneOf: [
          // 这里匹配 `<style module>`
          {
            resourceQuery: /module/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]_[hash:base64:5]',
                  },
                  localsConvention: 'camelCase',
                  sourceMap: true,
                },
              },
            ],
          },
          {
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'pug-plain-loader',
          },
        ],
      },
      {
        test: /\.html$/,
        oneOf: [
          {
            use: [
              {
                loader: 'html-loader',
                options: {
                  esModule: true,
                  minimize: false,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.(jpe?g|png)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 6000,
              name: 'img/[name]-[hash].[ext]',
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.san', '.json'],
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    overlay: true,
    hot: true,
    inline: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
    }),
    new SanLoaderPlugin(),
    // new MiniCssExtractPlugin({
    //     filename: '[name].css',
    //     chunkFilename: '[id].css'
    // }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
