// shim
import 'reflect-metadata';

import Koa from 'koa';
import { Container } from 'typedi';
import { useKoaServer, useContainer } from 'routing-controllers';
import bodyParser from 'koa-bodyparser';

import * as controllers from './src/controllers';
import * as interceptors from './src/routing-extends/interceptors';
import * as middlewares from './src/routing-extends/middlewares';

import { View } from './src/middlewares/view';

export default (async (): Promise<Koa> => {

	// 必须在所有routing-controllers操作前设置容器
	useContainer(Container);

	let app: Koa = new Koa();

	app.use(bodyParser());
	app = useKoaServer<Koa>(app, {
		controllers: Object.keys(controllers).map(name => controllers[name]),
		interceptors: Object.keys(interceptors).map(name => interceptors[name]),
		middlewares: Object.keys(middlewares).map(name => middlewares[name]),
		routePrefix: '/api',
	});
	
	const middleware = new View(app).render();

	app.use(middleware);
	app.listen(3000, () => {
		console.log('server success');		
	});

	return app;
})();

