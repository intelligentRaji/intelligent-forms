// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const config = {
  entry: './src/app.ts',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new ForkTsCheckerPlugin(),
  ],
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'esnext',
        css: true,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/i,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'esnext',
        },
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          stylesHandler,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      })
    );
  } else {
    config.mode = 'development';
  }
  config.experiments = {
    topLevelAwait: true,
  };
  return config;
};
