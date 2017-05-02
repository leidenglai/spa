var webpack = require('webpack');
var express = require('express');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var baseConfig = require('./webpack.config.base').config;
var commonPath = require('./webpack.config.base').commonPath;
var config = require('./webpack.config.dev');
var history = require('connect-history-api-fallback');

var app = express();

app.use('/static', express.static('static'));

// handle fallback for HTML5 history API
app.use(history());

var compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: baseConfig.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.listen(3000, '127.0.0.1', function(err) {
  err && console.log(err);
});
