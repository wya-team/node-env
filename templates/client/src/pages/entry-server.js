import { createApp } from './main';

const isDev = process.env.NODE_ENV !== 'production';

let serverCookies; // eslint-disable-line

export { serverCookies };
export default context => {
	return new Promise((resolve, reject) => {
		const s = isDev && Date.now();
		const { app, store, router } = createApp();
		const { url, cookies } = context;
		const { fullPath } = router.resolve(url).route;

		serverCookies = cookies;
		// 同样也可以处理为reject
		fullPath !== url 
			? router.push(fullPath)
			: router.push(url);
		
		router.onReady(() => {
			const matchedComponents = router.getMatchedComponents();
			if (!matchedComponents.length) {
				return reject({ code: 404 }); // eslint-disable-line
			}

			// 做一个约定，组件中含asyncData的生命周期为服务端发起请求拿数据
			Promise.all(
				matchedComponents.map(({ asyncData }) => {
					return asyncData && asyncData({
						store,
						route: router.currentRoute
					});
				})
			).then(() => {
				isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`);
				context.state = store.state;
				resolve(app);
			}).catch(reject);
		}, reject);
	});
};
