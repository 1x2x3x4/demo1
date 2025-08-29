// CommonJS 写法，Node ≥14 可直接运行
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 判断是否为开发模式
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: 'development',          // 或 'production'
  cache: false,
  entry: {
    internal: './src/main.js',
    external: './src/external.js',
  },
  output: {
    filename: 'js/[name].bundle.[contenthash].js',  // JS 文件放到 js 文件夹
    path: path.resolve(__dirname, 'docs'),   // 构建输出目录
    publicPath: './',                        // 使用相对路径，支持直接打开文件
    clean: true,
  },
  devtool: 'source-map',
  devServer: {
    // dev-server 会把构建产物放在内存中从"服务器根"提供；static 只用于磁盘上的额外静态文件
    static: [
      { directory: path.resolve(__dirname, 'docs') }, // 访问 docs 中的静态文件
      { directory: path.resolve(__dirname, '.') },    // 根目录下的 /CDN /public /TourGuide 等
    ],
    hot: true,
    open: ['index.html'],      // 本地直接打开 index.html
    port: 8081,
  },
  plugins: [
    // CSS 提取插件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'  // CSS 文件放到 css 文件夹
    }),
    // internal.html 走 Webpack bundle
    new HtmlWebpackPlugin({
      template: './public/internal.html',
      filename: 'internal.html',
      chunks: ['internal'],
    }),
    // index.html 作为"外部页/首页"，注入 external 入口的 bundle
    new HtmlWebpackPlugin({
      template: './public/external.html',
      filename: 'index.html',      // 作为首页
      chunks: ['external'],
      inject: 'head',              // 注入到 head 标签中，与 internal.html 保持一致
    }),
    // 将静态资源按类型分类复制
    new CopyWebpackPlugin({
      patterns: [
        // 其他静态资源：样式与第三方库
        { from: path.resolve(__dirname, 'public/styles.css'), to: 'css/styles.css' },
        { from: path.resolve(__dirname, 'CDN'), to: 'assets/CDN' },
        // 迁移后的引导资源从 src/widgets/tour-guide 输出到 assets/TourGuide
        { from: path.resolve(__dirname, 'src/widgets/tour-guide/config.json'), to: 'assets/TourGuide/config.json' },
        { from: path.resolve(__dirname, 'src/widgets/tour-guide/styles.css'), to: 'assets/TourGuide/tourGuide.css' },
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
  resolve: { 
    extensions: ['.js'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'  // 使用包含编译器的 Vue 版本（正确路径）
    }
  },
  performance: { hints: false },
};
