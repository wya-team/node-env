import { Get, Post, Ctx, JsonController, QueryParam } from 'routing-controllers';
import { Context } from 'koa';
import { Container } from 'typedi';
import { pick } from 'lodash';
import { UserService } from "../services"
import ft from "../entities/fields-table"

@JsonController()
export class UserController {

	private userService: UserService;

	constructor() {
		this.userService = Container.get(UserService);
	}

	@Post('/user/reg')
	async reg(@Ctx() ctx: Context): Promise<any> {
		let user = await this.userService.newAndSave(ctx.request.body);

		return pick(user, ft.user);
	}

	@Get('/user/ctx')
	async ctx(@Ctx() ctx: Context): Promise<any> {
		const { username } = ctx.query;
		return {
			msg: `hello ctx: ${username}`
		};
	}
}
