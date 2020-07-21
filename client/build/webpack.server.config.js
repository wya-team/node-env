const webpack = require('webpack');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const { resolve } = require('path');
const base = require('./webpack.base.config');

module.exports = merge(base, {
	target: 'node',
	devtool: '#source-map',
	entry: resolve(__dirname, '../src/pages/entry-server.js'),
	output: {
		filename: 'server-bundle.js',
		libraryTarget: 'commonjs2'
	},

	/**
	 * 处理相关提示
	 * It is recommended to externalize dependencies 
	 * in the server build for better build performance.
	 * 
	 * webpack.base.config.js 已设置 alias config
	 */
	externals: nodeExternals({
		whitelist: [
			/\.css$/,
			'config'
		]
	}),
	plugins: [
		new webpack.DefinePlugin({
			'__DEV__': process.env.NODE_ENV === 'production',
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"'
		}),
		new VueSSRServerPlugin()
	]
});
