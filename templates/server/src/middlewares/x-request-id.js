class XRequestId {
	/**
	 * X-Request-Id 唯一标识每个请求
	 */
	static init(opts = {}) {
		return (ctx, next) => {
			ctx.set('X-Request-Id', ctx.req.id);
			return next();
		};
	}
}

module.exports = XRequestId.init;