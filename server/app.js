const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const onerror = require('koa-onerror');
const favicon = require('koa-favicon');
const config = require('config');
const { pathToRegexp } = require('path-to-regexp');
const staticCache = require('koa-static-cache');
const Middlewares = require('./src/middlewares');

const { UserProxy } = require('./src/proxy');
const { Clean } = require('./src/utils');

const uploadDir = path.resolve(__dirname, 'config', config.get('upload.dir'));

const app = new Koa();

Clean.init();	
onerror(app);

// 静态资源的生产模式
const router = require('./src/router');

const serve = (prefix, filePath) => {
	return staticCache(path.resolve(__dirname, filePath), {
		prefix,
		gzip: true,
		dynamic: true,
		maxAge: 60 * 60 * 24 * 30
	});
};

app
	.use(Middlewares.IpFilter())
	.use(favicon(path.join(__dirname, './public/images/icon.png')))
	.use(serve('/dist', '../client/dist'))
	.use(serve('/public', './public'))
	.use(serve('/upload', uploadDir))
	.use(Middlewares.XRequestId())
	.use(Middlewares.Logger())
	.use(
		Middlewares.jwt().unless((ctx) => {
			if (/^\/api/.test(ctx.path)) {
				// RegExp: /?:^\/api\/user\/login[\/#\?]?$/i
				return pathToRegexp([
					'/api/user/login',
					'/api/user/reg'
				]).test(ctx.path);
			}
			return true;
		})
	)
	.use(koaBody({ 
		multipart: true, 
		jsonLimit: '2mb', 
		formLimit: '1mb', 
		textLimit: '1mb' 
	}))
	.use(router.api.routes())
	.use(router.api.allowedMethods());

if (process.env.NODE_ENV !== 'production') {
	app 
		.use(router.test.routes())
		.use(router.test.allowedMethods());
}
	

// 区分测试时调用
if (!module.parent) {
	const port = config.get('port');
	const host = config.get('host');
	const View = require('./src/middlewares/view');
	const middleware = new View(app).render();

	app.use(middleware);
	app.listen(port, host);
	console.log(`server started at http://${host}:${port}`);
}

module.exports = app;