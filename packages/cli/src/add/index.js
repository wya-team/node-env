const { prompt, Separator } = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const upath = require('upath');

const { resolve } = path;
module.exports = class AddManager {
	constructor(options = {}) {
		const defaultOptions = {
			// TODO
		};
		this.options = { ...defaultOptions, ...options };

		this.cwd = process.cwd();
		this.sourceDir = this.options.sourceDir;

		if (this.options.config) {
			this.configDir = path.resolve(this.options.config);
		}
	}

	/**
	 * 用于准备当前应用程序上下文的异步方法
	 * 其中包含加载页面和插件、应用插件等。
	 */
	async process() {
		console.log('TODO');
	}
};

