const fs = require('fs');
const { resolve } = require('path');
const _ = require('lodash');
const KoaRouter = require('koa-router');

const ALLOW_LOG = process.env.NODE_ENV !== 'test';

class Router {
	static METHODS = {
		GET: 'get',
		POST: 'post',
		PUT: 'put',
		DELETE: 'del'
	}

	/**
	 * 这里可以用sync是因为启动时只运行一次，不存在性能问题
	 */
	static addRoutes({ router, filepath }) {

		if (!router || !filepath) {
			throw new Error(`router和filepath为必填项`);
		}
		const { routes, controller, prefix } = require(filepath); // eslint-disable-line

		if (!controller || !prefix) {
			throw new Error(`controller和prefix为必填项`);
		}

		routes.forEach((url) => {
			const [type, path] = url.split(' ');
			const method = Router.METHODS[type.toUpperCase()];

			// 控制器上的方法
			const key = _.camelCase(path.split('/').slice(1).join('-'));
			if (!type || !path || !method || !controller[key]) { // eslint-disable-line
				ALLOW_LOG && console.error(`无效URL: ${url}`);
				return;
			}
			
			router[method](prefix + path, controller[key]); // eslint-disable-line
			ALLOW_LOG && console.log(`注册URL映射: ${type} ${path}`);
		});

		return router;
	}

	static rebuild({ router, dir, ignore = [] }) {

		if (!router || !dir) {
			throw new Error(`router和dir为必填项`);
		}

		const files = fs.readdirSync(dir); // eslint-disable-line
		// 过滤出.js文件:
		const JSFiles = files.filter(f => f.endsWith('.js'));

		for (const f of JSFiles) {
			const filepath = resolve(dir, f);
			ALLOW_LOG && console.log(`处理控制器: 「${filepath}」 ...`);

			if (ignore.some(i => i.test(filepath))) continue; // eslint-disable-line
			Router.addRoutes({ router, filepath });
		}

		return router;
	}
}

const testPath = resolve(__dirname, './controllers/test.js');

exports.api = Router.rebuild({
	router: new KoaRouter({ prefix: '/api' }), 
	dir: resolve(__dirname, './controllers'),
	ignore: [
		/test.js/
	]
});

exports.test = Router.addRoutes({
	router: new KoaRouter(),
	filepath: testPath
});