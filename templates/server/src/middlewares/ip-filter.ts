import { Middleware, Context, Next } from 'koa';
import ipFilter from 'ip-filter';
import config from 'config';

const blackIPs = config.get('blackList.ips');

export class IpFilter {
	/**
	 * 您的IP被限制访问
	 */
	static init(opts?: any): Middleware {
		return (ctx: Context, next: Next): Promise<any> => {
			if (ipFilter(ctx.ip, blackIPs, { strict: false })) {
				ctx.body = {
					status: 0,
					msg: '请求频率太快，已被限制访问'
				};
				return;
			}
			return next();
		};
	}
}
