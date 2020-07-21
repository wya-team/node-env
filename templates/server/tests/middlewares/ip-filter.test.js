const Koa = require('koa');
const request = require('supertest');
const Middleware = require('../../src/middlewares');

describe('middlewares/ip-filter', () => {

	test('ipFilter', async () => {
		const app = new Koa();
		app
			.use((ctx, next) => {
				// console.log(ctx.ip === '::ffff:127.0.0.1');
				ctx.request.ip = '127.0.0.1';
				return next();
			})
			.use(Middleware.IpFilter());
		const res = await request(app.callback()).get('/');
		expect(res.body.msg).toBe('请求频率太快，已被限制访问');
	});
});
