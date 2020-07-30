import { Middleware, Context, Next } from 'koa';

class XRequestId {
	/**
	 * X-Request-Id 唯一标识每个请求
	 */
	static init(opts?: any): Middleware {
		return (ctx: Context, next: Next): Promise<any> => {
			ctx.set('X-Request-Id', ctx.req.id as string);
			return next();
		};
	}
}

export default XRequestId.init;