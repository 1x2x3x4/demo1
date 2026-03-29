const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  cache: isDev,
  entry: {
    internal: './src/main.js',
    external: './src/external.js',
  },
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'docs'),
    publicPath: './',
    clean: !isDev,
  },
  devtool: isDev ? 'eval-cheap-module-source-map' : false,
  devServer: {
    static: [
      { directory: path.resolve(__dirname, 'docs') },
      { directory: path.resolve(__dirname, 'public') },
      { directory: path.resolve(__dirname, 'CDN') },
    ],
    hot: true,
    liveReload: true,
    watchFiles: ['src/**/*', 'public/**/*'],
    open: ['index.html'],
    port: 8081,
    compress: true,
    historyApiFallback: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    }),
    new HtmlWebpackPlugin({
      template: './public/internal.html',
      filename: 'internal.html',
      chunks: ['internal'],
    }),
    new HtmlWebpackPlugin({
      template: './public/external.html',
      filename: 'index.html',
      chunks: ['external'],
      inject: 'head',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'public/styles.css'), to: 'css/styles.css' },
        { from: path.resolve(__dirname, 'CDN'), to: 'assets/CDN' },
        { from: path.resolve(__dirname, 'src/widgets/tour-guide/config.json'), to: 'assets/TourGuide/config.json' },
        { from: path.resolve(__dirname, 'src/widgets/tour-guide/styles.css'), to: 'assets/TourGuide/tourGuide.css' },
        { from: path.resolve(__dirname, 'public/textures'), to: 'textures' },
        { from: path.resolve(__dirname, 'public/internal-loading-screen.js'), to: 'internal-loading-screen.js' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  externals: {
    vue: 'Vue'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  performance: {
    hints: isDev ? false : 'warning',
    maxAssetSize: 512000,
    maxEntrypointSize: 512000
  },
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        three: {
          test: /[\\/]node_modules[\\/]three[\\/]/,
          name: 'three',
          chunks: 'all',
          priority: 30,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
        },
      },
    },
    usedExports: true,
    sideEffects: false,
  },
};
