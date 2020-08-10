import { Get, Post, Ctx, JsonController, QueryParam, Body } from 'routing-controllers';
import { Context } from 'koa';
import { Container } from 'typedi';
import { ObjectID } from 'typeorm';
import { pick, merge } from 'lodash';
import config from 'config';
import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

import { TOKEN_KEY } from "../constants"
import { UserService } from "../services"
import { User } from "../entities"
import ft from "../entities/fields-table"
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
		ctx.cookies.set(TOKEN_KEY, token, this.getCookieOptions())

		return merge(pick(user, ft.user), { token });
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
