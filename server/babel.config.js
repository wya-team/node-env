const APP_ROOT = process.cwd();
const path = require('path');

module.exports = (api) => {
	console.log('server/babel.config.js');
	// 编译缓存
	api.cache.forever();
	return process.env.NODE_ENV === 'test'
		? {
			presets: [
				['@babel/preset-env', { targets: { node: 'current' } }]
			],
		}
		: {};
};
