const ipFilter = require('ip-filter');
const config = require('config');
const { Utils } = require('../utils');

const blackIPs = config.get('blackList.ips');

class IpFilter {
	/**
	 * 您的IP被限制访问
	 */
	static init(opts = {}) {
		return (ctx, next) => {
			if (ipFilter(ctx.ip, blackIPs, { strict: false })) {
				ctx.body = Utils.refail({ msg: '请求频率太快，已被限制访问' });
				return;
			}
			return next();
		};
	}
}

module.exports = IpFilter.init;