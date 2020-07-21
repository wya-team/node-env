import Vue from 'vue';
import { Storage, Device, URL } from '@wya/utils';
import { Vc, MToast, Clipboard } from '@wya/vc';
import { ajax } from '@wya/http';
import { merge } from 'lodash';

// 业务辅助
import { serviceManager } from '@stores/services/utils';
import { PRE_ROUTER_URL, TOKEN_KEY } from '../constants/constants';
import { Global } from './_global';

class HooksManager {
	constructor(options = {}) {
		if (typeof window === 'undefined') {
			return;
		}
		this.landingPage = `${window.location.pathname}${window.location.search}`;
	}

	/**
	 * 是否已经登录
	 */
	_isLoggedIn(opts = {}) {
		return true;
	}

	/**
	 * @public
	 * 设置登录状态, 开发模式下用的
	 */
	createLoginAuth = (user, replace = true, opts = {}) => {
		Global.updateUser(user);

		if (typeof window === 'undefined') {
			return;
		}

		window.routesManager && window.routesManager.reset();

		// 首页或者一开始记录的页面
		let path = this.landingPage.replace(new RegExp(PRE_ROUTER_URL), '/');
		path = /^\/login/.test(path) ? '/' : path;

		window.app && window.app.$router.replace(path);
	}

	/**
	 * @public
	 * 清除登录状态
	 */
	clearLoginAuth = (opts = {}) => {
		if (typeof window === 'undefined') {
			return;
		}
		
		Global.clearUser();
		Vc.instance.clearAll();
		serviceManager.clear();

		// 重置页面
		this.landingPage = `/`;

		/**
		 * 清理缓存后，跳转至login(即授权或模拟登录)
		 */
		window.app && window.app.$router.replace('/login');
	}

	/**
	 * @public
	 * 默认只分为两种情况，/login页面和非/login页面
	 * allow.regex: /^\/(login)$/
	 */
	beforeEach = async (to, from, next) => {
		next();
	}

	/**
	 * @public
	 */
	afterEach = (to, from) => {

	}
}

const hooks = new HooksManager();
const { beforeEach, afterEach, clearLoginAuth, createLoginAuth } = hooks;

export {
	beforeEach,
	afterEach,
	clearLoginAuth,
	createLoginAuth
};

export default hooks;

