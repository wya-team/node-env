import { Context, Next } from 'koa';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';
import { ValidationError } from "class-validator";

const env = process.env.NODE_ENV || 'development'
interface Result {
	status: number,
	msg: string,
	__DEV__?: any
}
/**
 * 参考koa-error
 */
@Middleware({ type: 'after' })
export class ErrorMiddleware implements KoaMiddlewareInterface {
	async use(ctx: Context, next: Next): Promise<any> {
		try {
			await next();
			ctx.response.status === 404
				&& !ctx.response.body
				&& ctx.throw(404);
		} catch (err) {
			ctx.status = 500;
			ctx.type = 'application/json';
			// ctx.app.emit('error', err, ctx);

			let msg: string = err.message;
			if (err[0] instanceof ValidationError) {
				msg = Object.entries(err[0].constraints)[0][1];
			}

			let result: Result = { status: 0, msg };
			if (env === 'development') {
				result.__DEV__ = {
					httpStatus: ctx.status,
					stack: err.stack,
					originalError: err
				};
			}
			ctx.body = result;
		}
	}
}
