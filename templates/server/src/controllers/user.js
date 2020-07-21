const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const config = require('config');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { Utils } = require('../utils');
const ft = require('../models/_fields_table');
const { UserProxy, AvatarProxy } = require('../proxy');

const jwtExpire = config.get('jwt.expire');

class UserController {

	/**
	 * 获取用户列表
	 * @interface /user/reg
	 */
	static async reg(ctx, next) {
		if (config.has('closeRegister') && config.get('closeRegister')) {
			return ctx.body = ctx.util.refail({ msg: '禁止注册，请联系管理员' });
		}

		const { username, email, password } = ctx.request.body;

		if (!email) {
			return ctx.body = Utils.refail({ msg: '邮箱不能为空' });
		}

		if (!password) {
			return ctx.body = Utils.refail({ msg: '密码不能为空' });
		}

		// 然后检查是否已经存在该用户
		const checkRepeat = await UserProxy.checkRepeat(email);

		if (checkRepeat > 0) {
			return ctx.body = Utils.refail({ msg: '该email已经注册' });
		}

		try {
			let user = await UserProxy.newAndSave({ username, email, password });

			user.token = UserController.getToken(user._id, user.passsalt);
			UserController.setCookie(ctx, user);

			ctx.body = Utils.resuccess({ msg: '注册成功', data: _.pick(user, ft.user) });
		} catch (e) {
			return ctx.body = Utils.refail({ msg: '数据写入失败' });
		}
	}

	/**
	 * 这里也可以偷懒，把jwtSecret秘钥换成固定值
	 * TODO: 单点登录
	 */
	static getToken(id, jwtSecret) {
		return jwt.sign(
			{ id }, 
			jwtSecret, 
			{ expiresIn: jwtExpire || '7 days' }
		);
	}

	static setCookie(ctx, user) {
		// 如果采用cookie验证的话
		ctx.cookies.set('_wapi_token_', user.token, {
			expires: Utils.expireDate(7),
			httpOnly: true
		});
	}

	/**
	 * 用户登录接口
	 * @interface /user/login
	 */
	static async login(ctx) {
		let { email, password } = ctx.request.body;

		if (!email) {
			return ctx.body = Utils.refail({ msg: '邮箱不能为空' });
		}

		if (!password) {
			return ctx.body = Utils.refail({ msg: '密码不能为空' });
		}

		let user = await UserProxy.findByEmail(email);

		if (!user) {
			return ctx.body = Utils.refail({ msg: '该用户不存在' });
		} else if (Utils.generatePassword(password, user.passsalt) === user.password) {

			user.token = UserController.getToken(user._id, user.passsalt);
			UserController.setCookie(ctx, user);

			ctx.body = Utils.resuccess({ msg: '登录成功', data: _.pick(user, ft.user) });
		} else {
			return ctx.body = Utils.refail({ msg: '密码错误' });
		}
	}

	/**
	 * 退出登录接口
	 * @interface /user/logout
	 * TODO: 清除了token, 但token还可以继续使用，存在安全问题
	 */
	async logout(ctx) {
		ctx.cookies.set('_wapi_token', null);
		ctx.body = Utils.resuccess();
	}

	/**
	 * 更新用户信息
	 * @param Object ctx
	 */
	static async update(ctx) {
		try {
			let { username, email } = ctx.request.body;
			let { id } = ctx.state.user;

			if (!username && !email) {
				return ctx.body = Utils.refail({ msg: '请输出相关字段' });
			}

			let user = await UserProxy.findById(id);

			if (!user) {
				return ctx.body = Utils.refail({ msg: '用户不存在' });
			}

			if (email) {
				const checkRepeat = await UserProxy.checkRepeat(email);
				if (checkRepeat > 0) {
					return ctx.body = Utils.refail({ msg: '该email已经注册' });
				}
			}

			let data = {
				username: username || user.username,
				email: email || user.email
			};
			let newUser = await UserProxy.update(id, data);

			// 不能使用{ ...user, ...data }
			ctx.body = Utils.resuccess({ msg: '修改成功', data: { ..._.pick(user, ft.user), ...data } });
		} catch (e) {
			ctx.body = Utils.refail({ msg: e.message });
		}
	}

	/**
	 * TODO: keywords过滤
	 */
	static async list(ctx) {
		const { page = 1, pageSize = 10 } = ctx.request.query;

		if (pageSize < 0) {
			return ctx.body = Utils.refail({
				msg: '参数错误'
			});
		}
		try {
			let users = await UserProxy.listWithPaging(page, pageSize);
			let count = await UserProxy.listCount();
			return (ctx.body = Utils.resuccess({
				data: {
					page: {
						count,
						current: page,
						total: Math.ceil(count / pageSize)
					},
					list: users.map(user => _.pick(user, ft.user))
				}
			}));
		} catch (e) {
			return ctx.body = Utils.refail({
				msg: '查询失败'
			});
		}
	}

	/**
	 * 修改用户密码
	 * @interface /user/change-password
	 */
	static async changePassword(ctx) {

		let { oldPassword, password } = ctx.request.body;
		let { id } = ctx.state.user;

		let user = await UserProxy.findById(id);

		if (!oldPassword) {
			return ctx.body = Utils.refail({
				msg: '旧密码不能为空'
			});
		}

		if (!password) {
			return ctx.body = Utils.refail({
				msg: '新密码不能为空'
			});
		}

		if (Utils.generatePassword(oldPassword, user.passsalt) !== user.password) {
			return ctx.body = Utils.refail({
				msg: '旧密码错误'
			});
		}

		let passsalt = Utils.randStr();
		let data = {
			up_time: Utils.time(),
			password: Utils.generatePassword(password, passsalt),
			passsalt
		};
		try {
			let result = await UserProxy.update(id, data);
			// 不能使用{ ...user, ...data }
			ctx.body = Utils.resuccess({ msg: '修改成功', data: { ..._.pick(user, ft.user), ...data } });
		} catch (e) {
			ctx.body = Utils.refail({ msg: e.message });
		}
	}

	/**
	 * 用于关联搜索
	 * @interface /user/search
	 */
	static async search(ctx) {
		// TODO
	}
}

module.exports = {
	prefix: '/user',
	controller: UserController,
	routes: [
		'GET /list',
		'POST /reg',
		'POST /login',
		'POST /update',
		'POST /change-password',
		// TODO: test
		'GET /logout'
	]
};
