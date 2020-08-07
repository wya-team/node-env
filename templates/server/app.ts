// shim
import 'reflect-metadata';

import Koa, { Middleware, Context } from 'koa';
import path from 'path';
import { Container } from 'typedi';
import { Connection } from 'typeorm';

import { useKoaServer, useContainer } from 'routing-controllers';
import bodyParser from 'koa-bodyparser';
import staticCache from 'koa-static-cache';
import onerror from 'koa-onerror';
import favicon from 'koa-favicon';
import config from 'config';

import { apiOptions, fakeOptions } from './src/routing';
import { USE_CLIENT_SSR, USE_DATA_BASE } from './src/constants';
import { Logger, XRequestId } from './src/middlewares';
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

export type DB = Connection | void;
export interface Ready {
	db: DB;
	app: Koa;
}

let dbReady: Promise<DB> = Promise.resolve();
// 连接接数据库
if (USE_DATA_BASE) {
	dbReady = require('./src/utils/db')?.default; // eslint-disable-line
}

const appReady = (async (): Promise<Koa> => {
	// start
	Clean.init();

	// 必须在所有routing-controllers操作前设置容器
	useContainer(Container);

	let app: Koa = new Koa();

	// koa-onerror, steam和event的错误捕获，中间件的错误中try catch
	onerror(app);

	// koa-middleware
	app
		.use(favicon(resolve('./public/images/icon.png')))
		.use(serve('/dist', '../client/dist'))
		.use(serve('/public', './public'))
		.use(serve('/upload', config.get('upload.dir'), true))
		.use(Logger.init())
		.use(XRequestId.init())
		.use(bodyParser({ ...config.get('bodyParser') }));

	// routes
	app = useKoaServer<Koa>(app, fakeOptions);
	app = useKoaServer<Koa>(app, apiOptions);

	// 区分测试时调用
	if (!module.parent) {
		const port: number = config.get('port');
		const host: string = config.get('host');

		if (USE_CLIENT_SSR) {
			const { View } = require('./src/middlewares/view'); // eslint-disable-line
			const middleware: Middleware = new View(app).render();
			app.use(middleware);
		}

		app.listen(port, host, () => {
			console.log(`server started at http://${host}:${port}`);
		});
	}

	return app;
})();

export default async (): Promise<Ready> => {
	const db: DB = await dbReady;
	const app: Koa = await appReady;
	return {
		db,
		app
	};
};
