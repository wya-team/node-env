// shim
import 'reflect-metadata';

import Koa, { Middleware } from 'koa';
import path from 'path';
import { Container } from 'typedi';
import { useKoaServer, useContainer } from 'routing-controllers';
import bodyParser from 'koa-bodyparser';
import staticCache from 'koa-static-cache';
import onerror from 'koa-onerror';
import favicon from 'koa-favicon';
import config from 'config';

import { apiOptions, fakeOptions } from './src/routing';

import * as Middlewares from './src/middlewares';
import { View } from './src/middlewares/view';
import { Clean } from './src/schedules';

const resolve = (...args: string[]): string => path.resolve(__dirname, ...args);

const serve = (prefix: string, filePath: string, baseConfig?: boolean): Middleware => {
	return staticCache(baseConfig ? resolve('config', filePath) : resolve(filePath), {
		prefix,
		gzip: true,
		dynamic: true,
		maxAge: 60 * 60 * 24 * 30
	});
};

export default (async (): Promise<Koa> => {
	// start
	Clean.init();

	// 必须在所有routing-controllers操作前设置容器
	useContainer(Container);

	let app: Koa = new Koa();

	// koa-onerror
	onerror(app);

	// koa-middleware
	app
		.use(favicon(resolve('./public/images/icon.png')))
		.use(serve('/dist', '../client/dist'))
		.use(serve('/public', './public'))
		.use(serve('/upload', config.get('upload.dir'), true))
		.use(Middlewares.Logger())
		.use(Middlewares.XRequestId())
		.use(bodyParser({ ...config.get('bodyParser') }));

	// routes
	app = useKoaServer<Koa>(app, fakeOptions);
	app = useKoaServer<Koa>(app, apiOptions);
	
	// 区分测试时调用
	if (!module.parent) {
		const port = config.get('port');
		const host = config.get('host');
		const middleware = new View(app).render();

		app.use(middleware);
		app.listen(port, host, () => {
			console.log(`server started at http://${host}:${port}`);	
		});
	}

	return app;
})();

