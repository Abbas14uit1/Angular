var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BundleAnalyzerPlugin =  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },

  module: {
    rules: [
      /**
       * Css loader support for *.css files (styles directory only)
       * Loads external css styles into the DOM, supports HMR
       */
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [helpers.root('src', 'styles')]
      },

      /**
       * Sass loader support for *.scss files (styles directory only)
       * Loads external sass styles into the DOM, supports HMR
       */
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: [helpers.root('src', 'styles')]
      },
    ]
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    new BundleAnalyzerPlugin()
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});