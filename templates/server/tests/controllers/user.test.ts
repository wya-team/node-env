import { Support, RequestMethod } from '../support';

describe('routers: users/user', () => {
	let $: RequestMethod;
	let $pure: RequestMethod;
	let user: any;
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

	const url = '/api/users';
	const param = { email: 'test@repo.com', password: '123456' };

	describe('POST /api/users', () => {
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

	describe('DELETE /api/users', () => {
		test('参数验证', async () => {
			const res = await $.put(url);
			expect(res.body.msg).toBe('Not Found');
		});

		test('删除操作', async () => {
			const currentParam = { email: 'delete@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			const res = await $.delete(`${url}/${id}`, token);
			expect(res.body.status).toBe(1);
		});

		test('删除操作 - 重复删除', async () => {
			const currentParam = { email: 'delete1@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			const res = await $.delete(`${url}/${id}`, token);
			expect(res.body.status).toBe(1);

			const errRes = await $.delete(`${url}/${id}`);
			expect(errRes.body.msg).toBe('当前用户不存在或已删除');
		});
	});

	describe('PUT /api/users', () => {
		test('参数验证: 直接访问', async () => {
			const res = await $.put(url);
			expect(res.body.msg).toBe('Not Found');
		});

		test('参数验证: 无参数传递', async () => {
			const res = await $.put(`${url}/${user.id}`);
			expect(res.body.msg).toBe('请输入需要修改的相关字段');
		});

		test('更新 - 修改用户名', async () => {
			const currentParam = { email: 'put@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			// 修改用户名
			const usernameParam = { username: 'admin1' };
			const usernameRes = await $.put(`${url}/${id}`, token).send(usernameParam);
			expect(usernameRes.body.data.username).toBe(usernameParam.username);
		});

		test('更新 - 修改密码', async () => {
			const currentParam = { email: 'put1@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			// 修改密码
			const passwordParam = { password: '1245678' };
			const passwordRes = await $.put(`${url}/${id}`, token).send(passwordParam);
			expect(passwordRes.body.status).toBe(1);
		});
	});

	describe('GET /api/users', () => {
		test('参数验证', async () => {
			const res = await $.get(url).query({ pageSize: -1 });
			expect(res.body.msg).toBe('参数错误');
		});

		test('分页查询', async () => {
			const res = await $.get(url);
			expect(res.body.data.list).toHaveLength(4); // admin, test, put, put1
		});
	});

	const aloneUrl = '/api/user';
	describe('POST /api/user - 登录', () => {
		test('参数验证: email', async () => {
			const res = await $pure.post(aloneUrl);
			expect(res.body.msg).toBe('邮箱地址必填');
		});

		test('参数验证: password', async () => {
			const res = await $pure.post(aloneUrl).send({ email: "test@repo.com" });
			expect(res.body.msg).toBe('密码必填');
		});

		test('当前账号未注册', async () => {
			const res = await $.post(aloneUrl).send({ email: 'notreg@repo.com', password: '123456' }).expect(200);
			expect(res.body.msg).toBe('当前账号未注册');
		});

		test('登录', async () => {
			const res = await $pure.post(aloneUrl).send(param);
			expect(res.body.status).toBe(1);
		});
	});

	describe('DELETE /api/user - 退出登录', () => {
		test('登录', async () => {
			const res = await $.delete(aloneUrl);
			expect(res.body.msg).toBe('已清除登录信息');
		});
	});

	describe('PUT /api/user', () => {
		test('修改当前用户信息: username', async () => {
			const currentParam = { email: 'put-current@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			const usernameParam = { username: 'put-current-test' };
			const usernameRes = await $.put(aloneUrl, token).send(usernameParam);
			expect(usernameRes.body.data.username).toBe(usernameParam.username);
		});

		test('修改当前用户密码: 旧密码为空', async () => {
			const currentParam = { email: 'put-current1@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			const passwordParam = { password: '1245678' };
			const passwordRes = await $.put(aloneUrl, token).send(passwordParam);
			expect(passwordRes.body.msg).toBe('旧密码不能为空');
		});

		test('修改当前用户密码: 旧密码错误', async () => {
			const currentParam = { email: 'put-current2@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			const passwordParam = { password: '1245678', oldPassword: '222' };
			const passwordRes = await $.put(aloneUrl, token).send(passwordParam);
			expect(passwordRes.body.msg).toBe('旧密码错误');
		});

		test('修改当前用户密码', async () => {
			const currentParam = { email: 'put-current3@repo.com', password: '123456' };
			const { id, token } = await Support.createUser(currentParam);

			const passwordParam = { password: '1245678', oldPassword: currentParam.password };
			const passwordRes = await $.put(aloneUrl, token).send(passwordParam);
			expect(passwordRes.body.status).toBe(1);
		});
	});

	describe('GET /api/user', () => {
		test('获取当前用户信息', async () => {
			const res = await $.get(aloneUrl);
			expect(res.body.data.username).toBe(user.username);
		});
	});
});
