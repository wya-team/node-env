import { Get, Post, Ctx, JsonController, QueryParam } from 'routing-controllers';
import { Context } from 'koa';
import { Container } from 'typedi';
import { UserService } from "../services"

@JsonController()
export class UserController {

	private userService: UserService;

	constructor() {
		this.userService = Container.get(UserService);
	}

	@Post('/user/reg')
	async reg(@Ctx() ctx: Context): Promise<any> {
		let user = await this.userService.newAndSave(ctx.request.body);
		return {
			msg: 'success'
		};
	}

	@Get('/user/ctx')
	async ctx(@Ctx() ctx: Context): Promise<any> {
		const { username } = ctx.query;
		return {
			msg: `hello ctx: ${username}`
		};
	}
}
