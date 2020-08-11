import { Middleware, Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import unless from 'koa-unless';
import { Container } from 'typedi';
import { UserService } from '../services';
import { User } from '../entities';

type Decoded = null | { [key: string]: any } | string;
type Token = void | boolean | string;

interface JWTMiddleware {
	(ctx: Context, next: Next): Promise<any>;
	unless: (verifyCallback?: (ctx: Context) => boolean) => Middleware;
}

/**
 * 鉴权
 * TODO:
 * 1. 如何强制秘钥失效
 * 2. 如何分权限管理提示
 */
export class JWT {
	static init(opts?: any): JWTMiddleware {
		const middleware = async (ctx: Context, next: Next): Promise<any> => {
			let token: Token = JWT.getCookies(ctx, opts) || JWT.getAuthHeader(ctx, opts);

			if (!token) {
				return JWT.refail(ctx, '无权限访问');
			}
			const decoded: Decoded = jwt.decode(token as string, { complete: true });
			if (
				!decoded
				|| typeof decoded === 'string'
				|| !decoded.header
			) {
				return JWT.refail(ctx, '非法Token');
			}

			// id不能是number类型，因为typeorm中findOne第一个参数为number时，是查询第{n}个实体
			if (
				decoded.payload
				&& typeof decoded.payload.id === 'number'
			) {
				return JWT.refail(ctx, '非法ID');
			}

			// 动态的secret，即salt，可以设计成固定值，如config.get('jwt.secret')
			let user: User;
			try {
				const userService: UserService = Container.get(UserService);
				user = await userService.findById(decoded.payload.id);
			} catch (e) {
				//
			}

			if (!user) {
				return JWT.refail(ctx, '用户不存在');
			}

			let session: any;
			try {
				session = jwt.verify(token as string, user.passsalt);
			} catch (err) {
				/* istanbul ignore next */
				return JWT.refail(ctx, err.expiredAt ? '登录已失效' : '登录凭证变更，请重新登录');
			}
			// 侵入式挂载, 这里已经记下了用户信息的查询，后续不在处理
			if (session && session.id === String(decoded.payload.id)) {
				// session 后续考虑注入其他信息;
				ctx.state.session = session;
				ctx.state.user = user;
				return next();
			} else {
				return JWT.refail(ctx, '非法登录');
			}
		};

		middleware.unless = unless;
		return middleware;
	}

	static getCookies(ctx: Context, opts?: any): Token {
		return opts && opts.cookie && ctx.cookies.get(opts.cookie);
	}

	static getAuthHeader(ctx: Context, opts: any): Token {
		if (!ctx.header || !ctx.header.authorization) {
			return;
		}

		const parts: string[] = ctx.header.authorization.split(' ');
		if (parts.length === 2) {
			const scheme: string = parts[0];
			const credentials: string = parts[1];

			if (/^Bearer$/i.test(scheme)) {
				return credentials;
			}
		}
	}

	static refail(ctx: Context, msg: string) {
		ctx.body = {
			status: 0,
			msg
		};
	}
}
