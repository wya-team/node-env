import { RoutingControllersOptions } from 'routing-controllers';

import * as apiControllers from '../controllers';
import * as fakeControllers from '../controllers/fake';
import * as interceptors from './interceptors';
import * as middlewares from './middlewares';

export const fakeOptions: RoutingControllersOptions = {
	routePrefix: '/fake',
	controllers: Object.keys(fakeControllers).map(name => fakeControllers[name]),
};

export const apiOptions: RoutingControllersOptions = {
	routePrefix: '/api',
	defaultErrorHandler: false, // 有自己的错误处理程序再禁用默认错误处理
	controllers: Object.keys(apiControllers).map(name => apiControllers[name]),
	interceptors: Object.keys(interceptors).map(name => interceptors[name]),
	middlewares: Object.keys(middlewares).map(name => middlewares[name])
};
