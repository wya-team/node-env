const webpack = require('webpack');
const { merge } = require('webpack-merge');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const { resolve } = require('path');

const isProd = process.env.NODE_ENV === 'production';
const base = require('./webpack.base.config');

const config = merge(base, {
	target: 'web',
	entry: {
		app: resolve(__dirname, '../src/pages/entry-client.js')
	},
	optimization: {
		minimize: isProd,
		namedModules: true,
		noEmitOnErrors: true,
		concatenateModules: isProd,
		splitChunks: {
			name: true,
			cacheGroups: {
				commons: {
					test: (chunk) => {
						const modules = [
							'vue',
							'vue-router',
							'vuex',
							'core-js',
							'lodash'
						];
						const isInModules = modules.some(i => (new RegExp(`([\\\\/]+)node_modules([\\\\/_]+)${i}`)).test(chunk.resource));
						return chunk.resource
							&& /\.js$/.test(chunk.resource)
							&& isInModules;
					},
					name: 'common',
					chunks: 'all',
				}
			}
		},
	},
	plugins: [
		// strip comments in Vue code
		new webpack.DefinePlugin({
			'__DEV__': process.env.NODE_ENV !== 'production',
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"'
		}),
		new VueSSRClientPlugin()
	]
});

module.exports = config;
