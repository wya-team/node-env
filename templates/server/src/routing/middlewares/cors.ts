import { Context, Next } from 'koa';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

/**
 * TODO: 用koa-cors代替
 */
@Middleware({ type: 'before' })
export class CORSMiddleware implements KoaMiddlewareInterface {
	async use(ctx: Context, next: Next): Promise<any> {
		ctx.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
		ctx.set(
			'Access-Control-Allow-Origin',
			ctx.request.header.origin || ctx.request.origin,
		);
		ctx.set('Access-Control-Allow-Headers', ['content-type']);
		ctx.set('Access-Control-Allow-Credentials', 'true');
		ctx.set('Content-Type', 'application/json; charset=utf-8');
		return next();
	}
}
