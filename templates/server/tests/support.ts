import request, { SuperTest, Test } from 'supertest';
import { Response } from 'koa';
import { getMongoRepository, MongoRepository, BaseEntity } from 'typeorm';

import ready, { Ready, DB } from '../app';
import * as entities from '../src/entities';

type Method = (url: string, ctoken?: string) => Promise<Response>;
export interface RequestMethod {
	get: Method;
	post: Method;
	put: Method;
	delete: Method;
}

export class Support {
	static async ready(): Promise<Ready> {
		const result = await ready();
		return result;
	}

	static async clean() {
		const { db } = await Support.ready();

		if (db) {
			// await Promise.all(Object.keys(entities).map(key => {
			// 	let repository: MongoRepository<BaseEntity> = db.getMongoRepository(entities[key]);
			// 	return repository.clear();
			// }));
			db.close();
		}
	}

	static async login(email: string, password: string) {
		const { app } = await Support.ready();
		return request(app.listen())
			.post('/api/user/login')
			.send({ email, password })
			.then((res: any) => {
				if (res.body.status === 1) {
					return res.body.data;
				} else {
					console.error(res.body.msg);
				}
			});
	}

	/**
	 * 创建一个登录的账户
	 */
	static async createUser(email = 'admin@wapi.com', password = '123456') {
		const { app } = await Support.ready();
		return request(app.listen())
			.post('/api/user/reg')
			.send({ email, password })
			.then(() => this.login(email, password));
	}

	/**
	 * 创建一个登录的账户
	 */
	static createRequest(server: any, token: string): any {
		let hook = (method: string): Method => {
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
	static createPureRequest(server: any): any {
		let hook = (method: string): Method => {
			return (url, ctoken) => {
				if (!ctoken) {
					return request(server)[method](url); // eslint-disable-line
				} else {
					return request(server)[method](url) // eslint-disable-line
						.set('Cookie', [`_repo_tag_=test;_repo_token_=${ctoken}`])
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
