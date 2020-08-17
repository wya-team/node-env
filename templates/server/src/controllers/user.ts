import { Get, Post, Put, Delete, Ctx, JsonController, QueryParam, Body, Param } from 'routing-controllers';
import { Context } from 'koa';
import { Container } from 'typedi';
import { ObjectID } from 'typeorm';
import _, { pick, merge } from 'lodash';
import config from 'config';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

import { TOKEN_KEY } from "../constants";
import { UserService } from "../services";
import { User } from "../entities";
import ft from "../entities/fields-table";

/**
 * 注意区分以下两个api
 * 1. 针对用于表的restful /users
 * 2. 针对当前登录/登录用户的位置操作 /user
 */
@JsonController()
export class UserController {

	private userService: UserService;

	constructor() {
		this.userService = Container.get(UserService);
	}

	/**
	 * TODO: 需要超级管理员, 才能进行查询，否者任意登录用户均可操作
	 */
	@Get('/users')
	async getAll(@Ctx() ctx: Context): Promise<any> {
		const { page = 1, pageSize = 10 } = ctx.request.query;

		if (pageSize < 0) {
			return '参数错误';
		}

		try {
			let users = await this.userService.listWithPaging(page, pageSize);
			let count = await this.userService.listCount();
			return {
				page: {
					count,
					current: Number(page),
					total: Math.ceil(count / pageSize)
				},
				list: users.map(user => pick(user, ft.user))
			};
		} catch (e) {
			console.log(e);
			return '查询失败';
		}
	}

	/**
	 * TODO: 同上
	 */
	@Get("/users/:id")
	async getOne(@Ctx() ctx: Context, @Param("id") id: string): Promise<any> {
		let user = await this.userService.findById(id);

		return pick(user, ft.user);
	}

	@Post('/users')
	async createOne(@Ctx() ctx: Context, @Body() body: User): Promise<any> {
		const user: User = await this.userService.create(body);

		return pick(user, ft.user);
	}

	/**
	 * TODO: 同上
	 */
	@Put('/users/:id')
	async updateOne(@Ctx() ctx: Context, @Param("id") id: string, @Body() body: any): Promise<any> {
		let user: User = await this.userService.findById(id);

		user = await this.userService.update(user, body);

		return pick(user, ft.user);
	}

	/**
	 * TODO: 同上
	 */
	@Delete('/users/:id')
	async deleteOne(@Ctx() ctx: Context, @Param("id") id: string): Promise<any> {
		const user = await this.userService.delete(id);

		return pick(user, ft.user);
	}

	@Get("/user")
	async getCurrent(@Ctx() ctx: Context): Promise<any> {
		// 仅用于测试数据
		const { delay } = ctx.request.query;
		if (delay) {
			await new Promise((resolve, reject) => {
				setTimeout(resolve, delay * 1000);
			});
		}
		return pick(ctx.state.user, ft.user);
	}

	@Post('/user')
	async login(@Ctx() ctx: Context, @Body() body: User): Promise<any> {
		let { email, password } = body;

		let user = await this.userService.findByEmail(email);
		if (password !== user.password) {
			return '密码错误';
		}

		let token: string = this._getToken(user.id, user.passsalt);
		ctx.cookies.set(TOKEN_KEY, token, this._getCookieOptions());

		return merge(pick(user, ft.user), { token });
	}

	/**
	 * 目前提供修改邮箱和用户名
	 */
	@Put('/user')
	async updateCurrent(@Ctx() ctx: Context, @Body() body: any): Promise<any> {
		const { user } = ctx.state;

		const { oldPassword, password } = body;
		if (password) {
			if (!oldPassword) {
				return '旧密码不能为空';
			}

			if (oldPassword !== user.password) {
				return '旧密码错误';
			}
		}

		return this.updateOne(ctx, user.id, body);
	}

	/**
	 * TODO: 清除了token, 但token还可以继续使用，存在安全问题
	 */
	@Delete('/user')
	async logout(@Ctx() ctx: Context): Promise<any> {
		ctx.cookies.set(TOKEN_KEY, null);

		return { msg: '已清除登录信息' };
	}

	/**
	 * 这里也可以偷懒，把jwtSecret秘钥换成固定值
	 * TODO: 单点登录
	 */
	private _getToken(id: ObjectID, jwtSecret: string): string {
		return jwt.sign(
			{ id },
			jwtSecret,
			{ expiresIn: config.get('jwt.expire') || '7 days' }
		);
	}


	/**
	 * 如果采用cookie验证的话
	 */
	private _getCookieOptions(day?: number): Cookies.SetOption {
		return {
			expires: new Date((new Date()).getTime() + (day || 7) * 86400000),
			httpOnly: true
		};
	}
}
