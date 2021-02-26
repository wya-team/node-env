import fs from 'fs-extra';
import path from 'path';
import Koa, { Context } from 'koa';
import {
	createBundleRenderer,
	BundleRenderer,
	BundleRendererOptions
} from 'vue-server-renderer';
import LRU from 'lru-cache';
import Cookies from 'universal-cookie';

const rootPath = process.cwd();
const resolve = (file: string): string => path.resolve(rootPath, file);
const isProd: boolean = process.env.NODE_ENV === 'production';

const resolvePackage = (source: string): string | void => {
	let nms = [
		path.resolve(rootPath, './node_modules', source),
		path.resolve(rootPath, './../node_modules', source)
	];

	let fullpath = nms.find(i => fs.pathExistsSync(i));

	if (!fullpath) {
		throw new Error(`未找到${source}\n nm1: ${nms[0]} \n nm2: ${nms[1]}`);
	}

	return fullpath;
};

/**
 * https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
 */
const createRenderer = (bundle: BundleRenderer, options?: BundleRendererOptions): BundleRenderer => {
	return createBundleRenderer(
		bundle,
		{
			...options,
			cache: new LRU({
				max: 1000,
				maxAge: 1000 * 60 * 15
			}),
			// this is only needed when vue-server-renderer is npm-linked
			basedir: resolve('../client/dist'),
			// recommended for performance
			runInNewContext: false
		}
	);
};

export class View {
	public getHTML: (params: any) => Promise<string> | void;

	constructor(app: Koa) {

		const templatePath = resolvePackage('@wya/repo-client/src/static/index.tpl.html');
		const template = fs.readFileSync(templatePath, 'utf-8'); // eslint-disable-line
		const run = isProd ? this.build : this.dev;

		this.getHTML = run(app, template);
	}

	/**
	 * 使用热更新, 文件修改时，会重新创建renderer
	 */
	private dev(app: Koa, template: string) {
		const setupDevServer = require('@wya/repo-client/build/setup-dev-server'); // eslint-disable-line

		// HRM时，renderer会利用回调重置
		let renderer;
		const { ready, server } = setupDevServer(
			template,
			(bundle, options) => (renderer = createRenderer(bundle, options))
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

		return (params) => ready.then(() => renderer.renderToString(params));
	}

	/**
	 * 使用生成好的文件利用createRenderer生成html
	 */
	private build(app: Koa, template: string) {
		const bundle = require('@wya/repo-client/dist/vue-ssr-server-bundle.json'); // eslint-disable-line
		const clientManifest = require('@wya/repo-client/dist/vue-ssr-client-manifest.json'); // eslint-disable-line
		const renderer = createRenderer(bundle, { template, clientManifest });
		return (params) => renderer.renderToString(params);
	}

	// 操作ctx.body, 不适用next
	render() {
		const getInjectInfo = require('@wya/repo-client/src/static/dynamic-inject'); // eslint-disable-line

		return async (ctx: Context) => {
			try {
				ctx.set('Content-Type', 'text/html');

				ctx.body = await this.getHTML({
					url: ctx.url,
					cookies: new Cookies(ctx.headers.cookie),
					headers: ctx.headers,
					inject: getInjectInfo(ctx) || {}
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
}
