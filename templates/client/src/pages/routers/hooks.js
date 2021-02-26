import { Global } from './_global';
import { IN_BROWSER } from '../constants/index';

// '/' 首页的情况下不重置路由
if (IN_BROWSER) {
	let original = window.history.replaceState;
	window.history.replaceState = (...args) => {
		if (window.location.pathname !== '/') {
			original.apply(window.history, args);
		}
	};
}

class HooksManager {
	/**
	 * @public
	 * 默认只分为两种情况，/login页面和非/login页面
	 * allow.regex: /^\/(login)$/
	 */
	beforeEach = async (to, from, next) => {
		if (/^(\/tpl\/)/.test(to.path)) {
			next();
			return;
		}

		let logged = Global.isLoggedIn();

		// 登录页
		if (to.path === '/login') {
			logged ? next('/') : next();
			return;
		}

		// 非登录页，已登录/未登陆
		logged ? next() : next('/login');
	}

	/**
	 * @public
	 */
	afterEach = (to, from) => {

	}
}

export default HooksManager;

