import Vue from 'vue';
import { createApp } from './main';
// import { Global } from './routers/_global';

const { app, store, router, routesManager } = createApp();

// 首次渲染由服务端完成（entry-server.js），单页面切换后调用asyncData达到服务端同样的效果
Vue.mixin({
	beforeRouteUpdate(to, from, next) {
		const { asyncData } = this.$options;
		if (asyncData) {
			asyncData({
				store: this.$store,
				route: to
			}).then(next).catch(next);
		} else {
			next();
		}
	}
});

// 状态在SSR期间确定并内联到页面标记中。
if (window.__INITIAL_STATE__) {
	store.replaceState(window.__INITIAL_STATE__);
}
// 先不考虑服务端渲染情况
router.onReady(() => {
	app.$mount('#pages');
});

window.app = app;
window.routesManager = routesManager;
