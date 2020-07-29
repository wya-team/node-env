// shim
import 'reflect-metadata';

import Koa from 'koa';
import { Container } from 'typedi';
import { useKoaServer, useContainer } from 'routing-controllers';
import bodyParser from 'koa-bodyparser';
import config from 'config';

import { apiOptions, fakeOptions } from './src/routing';

import { View } from './src/middlewares/view';

export default (async (): Promise<Koa> => {

	// 必须在所有routing-controllers操作前设置容器
	useContainer(Container);

	let app: Koa = new Koa();

	// koa-middleware
	app.use(bodyParser());

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

