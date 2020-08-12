import request, { Test } from 'supertest';
import { Response } from 'koa';
import jwt from 'jsonwebtoken';
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
			const res = await $.post(url);
			expect(res.body.msg).toBe('邮箱地址必填');
		});

		test('注册用户', async () => {
			const res = await $.post(url).send(param).expect(200);
			expect(res.body.data.email).toBe(param.email);
		});

		test('重复注册', async () => {
			const res = await $.post(url).send(param).expect(200);

			expect(res.body.msg).toBe('该email已经注册');
		});
	});

	/**
	 * POST /api/user/login
	 * req: { email, password }
	 * res: User
	 */
	describe('login', () => {
		const url = '/api/user/login';
		test('参数验证', async () => {
			const res = await $.post(url);

			expect(res.body.msg).toBe('邮箱不能为空');
		});

		test('登录', async () => {
			const res = await $.post(url)
				.send({ email: 'admin@repo.com', password: '123456' });

			expect(res.body.data.username).toBe('admin');
		});

		test('用户名错误', async () => {
			const res = await $.post(url)
				.send({ email: 'admin2@repo.com', password: '123456' });

			expect(res.body.msg).toBe('该用户不存在');
		});

		test('密码错误', async () => {
			const res = await $.post(url)
				.send({ email: 'admin@repo.com', password: '1234567' });

			expect(res.body.msg).toBe('密码错误');
		});
	});

	describe('update', () => {
		const url = '/api/user/update';
		test('参数验证', async () => {
			const res = await $.post(url).send();

			expect(res.body.msg).toBe('请输入要修改的相关字段');
		});

		test('信息更新', async () => {
			const res = await $.post(url)
				.send({
					username: 'admin2',
				});

			expect(res.body.data.username).toBe('admin2');
		});
	});

	describe('list', () => {
		const url = '/api/user/list';
		test('参数验证', async () => {
			const res = await $.get(url).query({ pageSize: -1 });
			expect(res.body.msg).toBe('参数错误');
		});

		test('分页查询', async () => {
			const res = await $.get(url);
			expect(res.body.data.list).toHaveLength(2);
		});
	});

	describe('concurrence', () => {
		test('接口请求时，ctx指向当前本身', async () => {
			const testloginUrl = '/api/user/login';
			const testloginRes = await $.post(testloginUrl)
				.send({ email: 'test@repo.com', password: '123456' });

			const targetUrl = '/api/user/current';
			const targetWait = $.get(`${targetUrl}?delay=3`);

			const compareRes = await $.get(`${targetUrl}`, testloginRes.body.data.token);
			const targetRes = await targetWait;

			expect(compareRes.body.data.email).toBe('test@repo.com');
			expect(targetRes.body.data.email).toBe('admin@repo.com');
		});
	});

	describe('change-password', () => {
		const url = '/api/user/change-password';
		test('参数验证', async () => {
			const res = await $.post(url).send();

			expect(res.body.msg).toBe('旧密码不能为空');
		});

		test('新密码不能为空', async () => {
			const res = await $.post(url)
				.send({
					oldPassword: '123456',
				});

			expect(res.body.msg).toBe('新密码不能为空');
		});

		test('旧密码错误', async () => {
			const res = await $.post(url)
				.send({
					oldPassword: '1234567',
					password: '123456',
				});

			expect(res.body.msg).toBe('旧密码错误');
		});

		test('修改成功', async () => {
			const res = await $.post(url)
				.send({
					oldPassword: '123456',
					password: '1234566',
				});

			// 上一步名字被变更
			expect(res.body.data.username).toBe('admin2');
		});
	});

	describe('authority', () => {
		const url = '/api/user/list';
		test('无权限拒绝', async () => {
			const res = await $pure.get(url);
			expect(res.body.msg).toBe('无权限访问');
		});

		test('非法Token', async () => {
			const res = await $pure.get(url, 'token123455');
			expect(res.body.msg).toBe('非法Token');
		});

		let token1 = jwt.sign({ id: 1 }, '4zpbhkp2n49', { expiresIn: '7 days' });
		test('非法ID', async () => {
			const res = await $pure.get(url, token1);
			expect(res.body.msg).toBe('非法ID');
		});

		let token2 = jwt.sign({ id: "1" }, '4zpbhkp2n49', { expiresIn: '7 days' });
		test('用户不存在', async () => {
			const res = await $pure.get(url, token2);
			expect(res.body.msg).toBe('用户不存在');
		});

		// 前一步修改了密码
		test('登录凭证变更，请重新登录', async () => {
			const res = await $.get(url);
			expect(res.body.msg).toBe('登录凭证变更，请重新登录');
		});
	});
});
