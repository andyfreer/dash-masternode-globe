var webpack = require('webpack');
var path = require('path');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

var PROD = !!JSON.parse(process.env.PROD_ENV || true);

module.exports = {
	entry: './src/js/main.js',
	output: {
		filename: 'dist/dash-masternode-globe.min.js'
	},
	resolve: {
		root: [ path.join( __dirname, 'src' ), path.join( __dirname, 'node_modules' ) ]
	},
	devtool: PROD ? null : 'eval-cheap-module-source-map',
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules(?!\/three)/,
				loader: 'babel',
				query: {
						presets: ['es2015'],
				}
			},
			{
				test: /\.glsl$/,
				exclude: /node_modules(?!\/three)/,
				loader: 'raw-loader'
			}
		]
	},
	plugins: PROD ? [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			mangle: {
				'keep_fnames': false
			}
		})
	] : [
		new BrowserSyncPlugin(
			// BrowserSync options
			{
				// browse to http://localhost:3000/ during development
				host: 'localhost',
				port: 3000,

				// proxy the Webpack Dev Server endpoint
				// through BrowserSync
				proxy: 'http://localhost:8080/',

				// watch for css changs
				files: [
					'dist/style.css',
					'index.html'
				]
			},
			// BrowserSyncPlugin options
			{
				reload: true
			}
		)
	]
};
