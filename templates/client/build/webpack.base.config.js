const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isProd = process.env.NODE_ENV === 'production';
const resolve = dir => path.resolve(__dirname, dir);

const postcssLoader = {
	loader: 'postcss-loader',
	options: {
		config: {
			path: resolve('./postcss.config.js')
		}
	}
};

module.exports = {
	mode: isProd ? 'production' : 'development',
	devtool: isProd ? false : 'cheap-module-eval-source-map',
	output: {
		path: resolve('../dist'),
		filename: 'js/[name].[hash:8].bundle.js', // 每个页面对应的主js的生成配置
		chunkFilename: 'js/[name].[hash:8].chunk.js', // chunk生成的配置
		/**
		 * html引用路径
		 * publicPath: ENV_IS_DEV ? './' : 'https://cdn.example.com/'
		 */
		publicPath: '/dist/',

	},
	resolve: {
		mainFiles: ['index'],
		extensions: ['.js', '.vue', '.json', '.scss', '.css'],
		alias: {
			// node_modules
			'vue$': 'vue/dist/vue.esm.js',

			// repo
			'@components': resolve('../src/pages/components'),
			'@constants': resolve('../src/pages/constants'),
			'@extends': resolve('../src/pages/extends'),
			'@containers': resolve('../src/pages/containers'),
			'@routers': resolve('../src/pages/routers'),
			'@utils': resolve('../src/pages/utils'),
			'@stores': resolve('../src/pages/stores'),
			'@mutations': resolve('../src/pages/stores/mutations'),
			'@common': resolve('../src/pages/components/_common')
		}
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							extends: resolve('../babel.config.js')
						}
					}
				]
			},
			{
				test: /\.vue$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'vue-loader',
						options: {
							preserveWhitespace: false
						}
					},
					{
						loader: '@wya/vc-loader',
					}
				]
			},
			{
				test: /\.(css|scss)$/,
				use: [
					'vue-style-loader', 
					'css-loader', 
					postcssLoader, 
					'sass-loader',
					{
						loader: 'sass-resources-loader',
						options: {
							resources: [
								resolve("../src/css/themes/index.scss")
							]
						}
					}
				],
				// 忽略全局的样式
				exclude: [
					resolve("../src/css")
				]
			},
			{
				test: /\.(css|scss)$/,
				use: [
					isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader', 
					'css-loader',
					postcssLoader,
					'sass-loader'
				],
				// 全局的样式
				include: [
					resolve("../src/css")
				]
			},
			{
				test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
				loader: 'url-loader',
				options: {
					limit: 10000
				}
			},
			{
				test: /\.html$/i,
				use: 'html-loader'
			}
		]
	},
	performance: {
		maxEntrypointSize: 300000,
		hints: isProd ? 'warning' : false
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: isProd ? 'css/initial.[name].[hash:8].css' : 'css/initial.css'
		}),
		new FriendlyErrorsPlugin(),
		new VueLoaderPlugin()
	]
};
