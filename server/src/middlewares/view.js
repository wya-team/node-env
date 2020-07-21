const fs = require('fs-extra');
const path = require('path');
const { createBundleRenderer } = require('vue-server-renderer');
const LRU = require('lru-cache');
const Cookies = require('universal-cookie');

const resolve = file => path.resolve(__dirname, file);
const isProd = process.env.NODE_ENV === 'production';

const resolvePackage = (source) => {
	let nms = [
		path.resolve(__dirname, '../../node_modules', source),
		path.resolve(__dirname, '../../../node_modules', source)
	];

	let fullpath = nms.find(i => fs.pathExistsSync(i));

	if (!fullpath) {
		throw new Error(`未找到${source}`);
	}

	return fullpath;
};

/**
 * https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
 */
function createRenderer(bundle, options) {
	return createBundleRenderer(
		bundle, 
		{
			...options,
			cache: new LRU({
				max: 1000,
				maxAge: 1000 * 60 * 15
			}),
			// this is only needed when vue-server-renderer is npm-linked
			basedir: resolve('../dist'),
			// recommended for performance
			runInNewContext: false
		}
	);
}

module.exports = class ViewMiddleware {
	constructor(app) {

		const templatePath = resolvePackage('@wya/repo-client/src/static/index.tpl.html');
		const template = fs.readFileSync(templatePath, 'utf-8'); // eslint-disable-line
		const run = isProd ? this._build : this._dev;

		this.getHTML = run(app, template);
	}

	/**
	 * 使用热更新, 文件修改时，会重新创建renderer
	 */
	_dev(app, template) {
		const setupDevServer = require('@wya/repo-client/build/setup-dev-server');

		// HRM时，renderer会利用回调重置
		let renderer;
		const { ready, server } = setupDevServer(
			template, 
			(...rest) => renderer = createRenderer(...rest)
		);

		// 重新封装一层，开发模式下静态资源，如访问/dist/app.js, 由此输出内容资源
		app.use(async (ctx, next) => {
			let devMiddleware = await server;
			// 如果返回了资源，ctx.body有值
			await devMiddleware(ctx, () => {});

			if (!ctx.body) {
				await next();
			}
		});

		return ctx => ready.then(() => renderer.renderToString(ctx));
	}

	/**
	 * 使用生成好的文件利用createRenderer生成html
	 */
	_build(app, template) {
		const bundle = require('@wya/repo-client/dist/vue-ssr-server-bundle.json');
		const clientManifest = require('@wya/repo-client/dist/vue-ssr-client-manifest.json');
		const renderer = createRenderer(bundle, { template, clientManifest });
		return (ctx) => renderer.renderToString(ctx);
	}

	// 操作ctx.body, 不适用next
	render() {
		return async (ctx) => {
			try {
				ctx.set('Content-Type', 'text/html');

				ctx.body = await this.getHTML({
					url: ctx.url,
					cookies: new Cookies(ctx.headers.cookie)
				});
				
			} catch (e) {
				if (e.code === 401) {
					ctx.status = 302;
					ctx.redirect('/login');
				} else {
					ctx.throw(e);
				}
			}
		};
	}
};
