const path = require('path');
const rimraf = require('rimraf');
const config = require('config');
const moment = require('moment');
const _ = require('lodash');

class Clean {
	static init() {
		this.dropFileSchedule();
	}

	/**
	 * 定时删除已经上传的过期文件
	 * 如路径：/wapi/public/upload/test/2020/05/14/{*.json,*.jpg}  
	 * TODO: 删除昨天的资源
	 */
	static dropFileSchedule() {
		const conf = config.get('upload');
		const expireDay = conf.expire.day;

		/* istanbul ignore else */
		if (typeof expireDay === 'number' && expireDay > 0) {
			const expireTypes = conf.expire.types.map(type => `*${type}`).join(',');
			const date = moment().subtract(expireDay, 'days').format('YYYY/MM/DD');
			const uploadDir = path.resolve(__dirname, '../../config', conf.dir, date);
			const commandPath = `${uploadDir}/{${expireTypes}}`;

			rimraf(commandPath, _.noop);
			setInterval(() => rimraf(commandPath, _.noop), 1000 * 60 * 60);
		}
	}
}

module.exports = Clean;