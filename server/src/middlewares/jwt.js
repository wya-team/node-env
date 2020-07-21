const jwt = require('jsonwebtoken');
const unless = require('koa-unless');
const { Utils } = require('../utils');
const { UserProxy } = require('../proxy');

/**
 * 鉴权
 * TODO: 
 * 1. 如何强制秘钥失效
 * 2. 如何分权限管理提示
 */
class JWT {
	static init(opts = {}) {
		const middleware = async function (ctx, next) {
			let token = JWT.getCookies(ctx, opts) || JWT.getAuthHeader(ctx, opts);

			if (!token) {
				return JWT.refail(ctx, '无权限访问');
			}

			const decoded = jwt.decode(token, { complete: true });

			if (!decoded || !decoded.header) {
				return JWT.refail(ctx, '非法Token');
			}
			// 动态的secret，即salt，可以设计成固定值，如config.get('jwt.secret')
			let result;
			try {
				result = await UserProxy.findById(decoded.payload.id);
			} catch (e) {
				return JWT.refail(ctx, '用户不存在');
			}

			let user;
			try {
				user = jwt.verify(token, result.passsalt);
			} catch (err) {
				/* istanbul ignore next */ 
				return JWT.refail(ctx, err.expiredAt ? '登录已失效' : '登录凭证变更，请重新登录');
			}

			if (user && user.id === String(decoded.payload.id)) {
				// 侵入式挂载
				ctx.state.user = user;
				return next();
			} else {
				JWT.refail(ctx, '非法登录');
			}
		};
		middleware.unless = unless;
		return middleware;
	}

	static refail(ctx, msg) {
		ctx.body = Utils.refail({ msg });
	}

	static getCookies(ctx, opts) {
		return opts.cookie && ctx.cookies.get(opts.cookie);
	}

	static getAuthHeader(ctx, opts) {
		if (!ctx.header || !ctx.header.authorization) {
			return;
		}

		const parts = ctx.header.authorization.split(' ');
		if (parts.length === 2) {
			const scheme = parts[0];
			const credentials = parts[1];

			if (/^Bearer$/i.test(scheme)) {
				return credentials;
			}
		}
	}
}

module.exports = JWT.init;