var path = require('path'),
  fs = require('fs'),
  webpack = require('webpack'),
  baseConfig = require('./webpack.config.base'),
  config = baseConfig.config,
  commonPath = baseConfig.commonPath,

  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),

  SOURCE_MAP = true;

var rootPath = path.resolve(__dirname, '..'), // 项目根目录
  src = path.join(rootPath, 'src'), // 开发源码目录
  env = process.env.NODE_ENV.trim(); // 当前环境

config.output.filename = '[name].[chunkhash:6].js';
config.output.chunkFilename = '[id].[chunkhash:6].js';

config.devtool = SOURCE_MAP ? 'hidden-source-map' : false;

// 生产环境下分离出 CSS 文件
config.module.rules.push({
  test: /\.css$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: ['css-loader', 'postcss-loader']
  })
}, {
  test: /\.less$/,
  loader: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
     'css-loader',
     'postcss-loader',
     'less-loader'
    ]
  })
});

config.plugins.push(
  new CleanWebpackPlugin('dist', {
    root: commonPath.rootPath,
    verbose: false
  }),
  new CopyWebpackPlugin([ // 复制高度静态资源
    {
      context: commonPath.staticDir,
      from: '**/*',
      ignore: ['*.md']
    }
  ]),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: false
  }),
  new webpack.optimize.MinChunkSizePlugin({
    minChunkSize: 30000
  }),
  new ExtractTextPlugin({
    filename: '[name].[contenthash:6].css',
    allChunks: true // 若要按需加载 CSS 则请注释掉该行
  }),
  new HtmlWebpackPlugin({
    filename: '../index.html',
    template: commonPath.indexHTML,
    chunksSortMode: 'dependency'
  })
);

module.exports = config;
