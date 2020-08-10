import request from 'supertest';
import { Response } from 'koa';
import { Support, RequestMethod } from '../support';
import { User } from '../../src/entities';

describe('routers: user', () => {
	let $: RequestMethod;
	let $pure: RequestMethod;
	let user: User;
	beforeAll(async (done) => {
		let { db, app } = await Support.ready();

		user = await Support.createUser();
		$ = await Support.createRequest(app.listen(), user.token);
		$pure = await Support.createPureRequest(app.listen());

		done();
	});

	afterAll(async done => {
		await Support.clean();
		done();
	});

	/**
	 * POST /api/user/reg
	 * req: { email, password, username }
	 * res: User
	 */
	describe('register', () => {
		const url = '/api/user/reg';
		const param = { email: 'test@repo.com', password: '123456' };

		test('参数验证', async () => {
			const res: Response = await $.post(url);
			console.log(res.body);
		});
	});
});
