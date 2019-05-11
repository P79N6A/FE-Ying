const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackConfigs = require('./webpack.base.js');

module.exports = merge(webpackConfigs, {
    mode: 'development',
    devtool: 'source-map',
});
