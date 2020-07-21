const sha1 = require('sha1');

const STATUS_MAP = {
	'0': 'fail',
	'1': 'success',
	'401': 'token expired',
	'500': 'server error',
	'10001': 'params error'
};

class Utils {

	static resuccess(opts = {}) {
		const { msg, status, data, extra = {} } = opts;

		return {
			status: status || 1,
			msg: msg || STATUS_MAP['1'],
			data: data || null,
			...extra
		};
	}

	static refail(opts = {}) {
		const { msg, status, data, extra = {} } = opts;
		return {
			status: status || 0,
			msg: msg || STATUS_MAP[status], // eslint-disable-line
			data: data || null
		};
	}

	static randStr() {
		return Math.random()
			.toString(36)
			.substr(2);
	}

	static generatePassword(password, passsalt) {
		return sha1(password + sha1(passsalt));
	}

	static time() {
		return Date.parse(new Date()) / 1000;
	}

	static expireDate(day) {
		let date = new Date();
		date.setTime(date.getTime() + day * 86400000);
		return date;
	}
}

module.exports = Utils;	
