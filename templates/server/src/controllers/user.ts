import { Get, Post, Ctx, JsonController, QueryParam, Body, Param } from 'routing-controllers';
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
@JsonController()
export class UserController {

	private userService: UserService;

	constructor() {
		this.userService = Container.get(UserService);
	}

	@Post('/user/reg')
	async reg(@Body() body: User): Promise<any> {
		const checkRepeat: number = await this.userService.checkRepeat(body.email);

		if (checkRepeat > 0) {
			return '该email已经注册';
		}

		const user: User = await this.userService.newAndSave(body);

		return pick(user, ft.user);
	}

	@Post('/user/login')
	async login(@Ctx() ctx: Context): Promise<any> {
		let { email, password } = ctx.request.body;

		if (!email) {
			return '邮箱不能为空';
		}

		if (!password) {
			return '密码不能为空';
		}

		let user = await this.userService.findByEmail(email);

		if (!user) {
			return '该用户不存在';
		}
		if (password !== user.password) {
			return '密码错误';
		}

		let token: string = this.getToken(user.id, user.passsalt);
		ctx.cookies.set(TOKEN_KEY, token, this.getCookieOptions());

		return merge(pick(user, ft.user), { token });
	}

	/**
	 * TODO: 清除了token, 但token还可以继续使用，存在安全问题
	 */
	@Post('/user/logout')
	async logout(@Ctx() ctx: Context): Promise<any> {
		ctx.cookies.set(TOKEN_KEY, null);

		return { msg: '已清除登录信息' };
	}

	/**
	 * 目前提供修改邮箱和用户名
	 */
	@Post('/user/update')
	async update(@Ctx() ctx: Context): Promise<any> {
		let { username, email } = ctx.request.body;
		if (!username && !email) {
			return '请输入要修改的相关字段';
		}

		if (email) {
			const checkRepeat = await this.userService.checkRepeat(email);
			if (checkRepeat > 0) {
				return '该email已经注册';
			}
		}

		let { user } = ctx.state;
		user.username = username || user.username;
		user.email = email || user.email;

		// TODO: 如果是失败的情况，需要进行回滚ctx.state.user
		let newUser = await this.userService.update(user);
		return pick(newUser, ft.user);
	}

	@Post('/user/change-password')
	async changePassword(@Ctx() ctx: Context): Promise<any> {
		let { oldPassword, password } = ctx.request.body;

		if (!oldPassword) {
			return '旧密码不能为空';
		}

		if (!password) {
			return '新密码不能为空';
		}
		let { user } = ctx.state;
		if (oldPassword !== user.password) {
			return '旧密码错误';
		}

		// TODO: 加密
		user.password = password;
		user.passsalt = password;

		// TODO: 如果是失败的情况，需要进行回滚ctx.state.user
		let newUser = await this.userService.update(user);
		return pick(newUser, ft.user);
	}

	@Get("/user/current")
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

	/**
	 * TODO: 是否需要验证权限，否则只要登录了，所有信息可查
	 */
	@Get('/user/list')
	async list(@Ctx() ctx: Context): Promise<any> {
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
	 * TODO: 是否需要验证权限，否则只要登录了，所有信息可查
	 */
	@Get("/user/:id")
	async getOne(@Param("id") id: string): Promise<any> {
		let user = await this.userService.findById(id);

		return pick(user, ft.user);
	}

	/**
	 * 这里也可以偷懒，把jwtSecret秘钥换成固定值
	 * TODO: 单点登录
	 */
	getToken(id: ObjectID, jwtSecret: string): string {
		return jwt.sign(
			{ id },
			jwtSecret,
			{ expiresIn: config.get('jwt.expire') || '7 days' }
		);
	}


	/**
	 * 如果采用cookie验证的话
	 */
	getCookieOptions(day?: number): Cookies.SetOption {
		return {
			expires: new Date((new Date()).getTime() + (day || 7) * 86400000),
			httpOnly: true
		};
	}
}
