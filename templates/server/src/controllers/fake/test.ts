import { Get, Ctx, JsonController, QueryParam } from 'routing-controllers';
import { Context } from 'koa';

@JsonController()
export class TestController {
	constructor() {}

	@Get('/test/basic')
	async basic(@QueryParam('username') username: string): Promise<any> {
		return {
			msg: `hello basic: ${username}`
		};
	}

	@Get('/test/ctx')
	async ctx(@Ctx() ctx: Context): Promise<any> {
		const { username } = ctx.query;
		return {
			msg: `hello ctx: ${username}`
		};
	}
}
