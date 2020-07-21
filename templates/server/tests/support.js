const request = require('supertest');

const app = require('../app');
const { db, ...models } = require('../src/models');

class Support {
	static async cleanCollections() {
		let keys = Object.keys(models);
		await Promise.all(Object.keys(models).map(key => models[key].deleteMany({}).exec())); // eslint-disable-line

		try {
			let instance = await db;
			await instance.disconnect();
		} catch (e) {
			console.log(e, 222);
		}

	}

	static login(email, password) {
		return request(app.listen())
			.post('/api/user/login')
			.send({ email, password })
			.then(res => {
				if (res.body.status === 1) {
					return res.body.data;
				} else {
					console.error(res.body.msg);
				}
			});
	}

	static createUser(email = 'admin@wapi.com', password = '123456') {
		return request(app.listen())
			.post('/api/user/reg')
			.send({ email, password })
			.then(() => this.login(email, password));
	}

	/**
	 * 创建一个登录的账户
	 */
	static createRequest(server, token) {
		let hook = (method) => {
			return (url, ctoken = token) => request(server)[method](url) // eslint-disable-line
				.set('Cookie', [`_wapi_tag_=test;_wapi_token_=${ctoken}`])
				.set('Authorization', 'Bearer ' + ctoken); // koa-jwt
		};

		return {
			get: hook('get'),
			post: hook('post'),
			put: hook('put'),
			delete: hook('delete'),
		};
	}

	/**
	 * 无任何权限的
	 */
	static createPureRequest(server) {
		let hook = (method) => {
			return (url, ctoken) => {
				if (!ctoken) {
					return request(server)[method](url); // eslint-disable-line
				} else {
					return request(server)[method](url) // eslint-disable-line
						.set('Cookie', [`_wapi_tag_=test;_wapi_token_=${ctoken}`])
						.set('Authorization', 'Bearer ' + ctoken); // koa-jwt
				}
			};
		};

		return {
			get: hook('get'),
			post: hook('post'),
			put: hook('put'),
			delete: hook('delete'),
		};
	}
}

module.exports = Support;
