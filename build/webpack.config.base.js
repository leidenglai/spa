var path = require('path'),
  webpack = require('webpack'),
  NyanProgressPlugin = require('nyan-progress-webpack-plugin'),
  LodashModuleReplacementPlugin = require('lodash-webpack-plugin'),
  pxtorem = require('postcss-px2rem'),
  rucksack = require('rucksack-css'),
  autoprefixer = require('autoprefixer');

// 静态资源目录
const CDN_PATH = "http://static.xxxxx.com";

var rootPath = path.resolve(__dirname, '..'), // 项目根目录
  src = path.join(rootPath, 'src'), // 开发源码目录
  env = process.env.NODE_ENV.trim(); // 当前环境
var commonPath = {
  rootPath: rootPath,
  dist: path.join(rootPath, 'dist'), // build 后输出目录
  indexHTML: path.join(src, 'index.html'), // 入口基页
  staticDir: path.join(rootPath, 'static') // 无需处理的静态资源目录
};

module.exports = {
  commonPath: commonPath,

  // webpack主要公共配置
  config: {
    entry: {
      app: path.join(src, 'index.js')
    },
    output: {
      path: path.join(commonPath.dist, 'static'),
      publicPath: CDN_PATH
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        // ================================
        // 自定义路径别名
        // ================================
        tpl: path.join(src, 'tpl'),
        libs: path.join(src, 'libs'),
        js: path.join(src, 'js'),
        components: path.join(src, 'js/components'),
        utils: path.join(src, 'js/utils'),
        config: path.join(src, 'js/config'),
        constants: path.join(src, 'js/constants'),
        css: path.join(src, 'css'),
        img: path.join(src, 'img')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            'babel-loader?' + JSON.stringify({
              cacheDirectory: true,
              plugins: [
                'transform-runtime',
                'transform-decorators-legacy',
                "lodash"
              ],
              presets: [
                ["es2015", { "modules": false }],
                'stage-2'
              ]
            })
          ],
          // include: src,
          exclude: /node_modules/
        },
        {
          test: require.resolve(path.join(src, 'libs/zepto')),
          loader: 'exports-loader?window.$!exports-loader?window.Zepto!script-loader'
        },
        {
          test: /\.html$/,
          use: [{
            loader: 'html-loader',
            options: {
              attrs: ['img:src']
            }
          }]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 10240, // 10KB 以下使用 base64
            name: 'img/[name]-[hash:6].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/,
          loader: 'url-loader?limit=10240&name=fonts/[name]-[hash:6].[ext]'
        }
      ]
    },
    plugins: [
      new NyanProgressPlugin(), // 进度条
      new webpack.ProvidePlugin({
        $: path.join(src, 'libs/zepto'),
        Zepto: path.join(src, 'libs/zepto'),
        '_': 'lodash'
      }),

      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: [
            rucksack(),
            autoprefixer({
              browsers: ['last 2 versions', '> 5%'],
              env: "Android, and_chr, ios_saf, op_mob, and_qq, and_uc, and_ff"
            }),
            pxtorem({
              remUnit: 75
            })
          ]
        }
      }),

      new webpack.optimize.CommonsChunkPlugin({

        // 公共代码分离打包
        // names: ['vendor']

        names: ['manifest'],
        minChunks: 'Infinity'
      }),

      /**
       * https://github.com/lodash/lodash-webpack-plugin
       * 按需打包Lodash.js
       */
      new LodashModuleReplacementPlugin({
        'shorthands': true,
        'collections': true,
        'caching': true
      }),

      new webpack.DefinePlugin({
        'process.env': { // 这是给 React / Redux 打包用的
          NODE_ENV: JSON.stringify('production')
        },
        // ================================
        // 配置开发全局常量
        // ================================
        __DEV__: env === 'development',
        __PROD__: env === 'production',
        __COMPONENT_DEVTOOLS__: false, // 是否使用组件形式的 Redux DevTools
        __WHY_DID_YOU_UPDATE__: false // 是否检测不必要的组件重渲染
      })
    ]
  }
}
