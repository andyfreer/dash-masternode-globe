var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/js/main.js',
  output: {
    filename: 'dist/dash-masternode-globe.min.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
            presets: ['es2016']
        }
      },
      {
        test: /\.js$/,
        loader: 'exports'
      },
      {
        test: /\.js$/,
        loader: 'imports'
      }
    ]
  }
};
