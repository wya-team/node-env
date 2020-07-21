const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const mkdirp = require('mkdirp');
const moment = require('moment');
const koaPinoLogger = require('koa-pino-logger');
const { multistream } = require('pino-multi-stream');

class Logger {
	static init(opts = {}) {

		const streamOpt = { flags: 'a', encoding: 'utf8' };
		const date = moment().format('YYYY-MM-DD');
		const logDir = path.join(__dirname, '../../logs');

		/**
		 * 默认打印在控制台，生成模式下打印在本地文件中
		 * 主要利用 res.on('(finish|error)', cb)
		 */
		let streams = [
			{ level: 'info', stream: process.stdout },
			{ level: 'error', stream: process.stderr }
		];

		/* istanbul ignore if */
		if (process.env.NODE_ENV === 'production') {
			if (!fs.existsSync(logDir)) mkdirp.sync(logDir); // eslint-disable-line

			streams = [
				{ level: 'info', stream: fs.createWriteStream(`logs/${date}-info.log`, streamOpt) }, // eslint-disable-line
				{ level: 'error', stream: fs.createWriteStream(`logs/${date}-error.log`, streamOpt) } // eslint-disable-line
			];
		}

		return koaPinoLogger({
			name: '@wya/repo',
			level: process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'info',
			genReqId: req => req.headers['x-request-id'] || uuid.v4()
		}, multistream(streams));
	}
}
module.exports = Logger.init;
