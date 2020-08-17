import request, { SuperTest, Test } from 'supertest';
import { Response } from 'koa';
import { getMongoRepository, MongoRepository, BaseEntity } from 'typeorm';

import ready, { Ready, DB } from '../app';
import * as entities from '../src/entities';

type Method = (url: string, ctoken?: string) => any;
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

	static async clean(opts?: any) {
		const { db } = await Support.ready();
		const { close = true } = opts || {};
		// 清空数据库
		if (db) {
			await Promise.all(Object.keys(entities).map(key => {
				let repository: MongoRepository<BaseEntity> = db.getMongoRepository(entities[key]);
				// 可能存在实体没有创建，MongoError: ns not found
				return repository.clear().catch((e) => Promise.resolve(e));
			}));
			close && db.close();
		}
	}

	static async login(email: string, password: string) {
		const { app } = await Support.ready();
		return request(app.listen())
			.post('/api/user')
			.send({ email, password })
			.then((res: any) => {
				if (res.body.status === 1) {
					return res.body.data;
				} else {
					console.error('/api/user:', res.body);
					return Promise.reject();
				}
			});
	}

	/**
	 * 创建一个登录的账户
	 */
	static async createUser(opts?: any) {
		const { email = 'admin@repo.com', password = '123456' } = opts || {};
		const { app } = await Support.ready();
		return request(app.listen())
			.post('/api/users')
			.send({ email, password })
			.then((res) => {
				if (res.body.status === 1) {
					return this.login(email, password);
				} else {
					console.error('/api/users:', res.body);
					return Promise.reject();
				}
			});
	}

	/**
	 * 创建一个登录的账户
	 */
	static createRequest(server: any, token: string): any {
		let hook = (method: string): Method => {
			return (url, ctoken = token) => request(server)[method](url) // eslint-disable-line
				.set('Cookie', [`_repo_tag_=test;_repo_token_=${ctoken}`])
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
