import Koa from 'koa';
import request from 'supertest';
import { IpFilter } from '../../src/middlewares';

describe('middlewares/ip-filter', () => {
	test('IpFilter', async () => {
		const app = new Koa();
		app
			.use((ctx, next) => {
				// console.log(ctx.ip === '::ffff:127.0.0.1');
				ctx.request.ip = '127.0.0.1';
				return next();
			})
			.use(IpFilter.init());

		const res = await request(app.callback()).get('/');

		expect(res.body.msg).toBe('请求频率太快，已被限制访问');
	});
});

