import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

/**
 * TODO: 用koa-cors代替
 */
@Middleware({ type: 'before' })
export class CORSMiddleware implements KoaMiddlewareInterface {
	async use(context: any, next: (err?: any) => any): Promise<any> {
		context.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
		context.set(
			'Access-Control-Allow-Origin',
			context.request.header.origin || context.request.origin,
		);
		context.set('Access-Control-Allow-Headers', ['content-type']);
		context.set('Access-Control-Allow-Credentials', 'true');
		context.set('Content-Type', 'application/json; charset=utf-8');
		return next();
	}
}
