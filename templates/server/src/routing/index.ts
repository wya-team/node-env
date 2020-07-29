import { RoutingControllersOptions } from 'routing-controllers';

import * as apiControllers from '../controllers';
import * as fakeControllers from '../controllers/fake';
import * as interceptors from './interceptors';
import * as middlewares from './middlewares';

export const fakeOptions: RoutingControllersOptions = {
	controllers: Object.keys(fakeControllers).map(name => fakeControllers[name]),
	routePrefix: '/fake',
};

export const apiOptions: RoutingControllersOptions = {
	controllers: Object.keys(apiControllers).map(name => apiControllers[name]),
	interceptors: Object.keys(interceptors).map(name => interceptors[name]),
	middlewares: Object.keys(middlewares).map(name => middlewares[name]),
	routePrefix: '/api',
};