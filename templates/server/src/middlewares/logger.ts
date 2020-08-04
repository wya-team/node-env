import fs from 'fs';
import * as uuid from 'uuid';
import path from 'path';
import mkdirp from 'mkdirp';
import moment from 'moment';
import pinoLogger from 'koa-pino-logger';
import { Middleware, Request } from 'koa';
import { DestinationStream } from 'pino';
import { Options } from 'pino-http';
import { multistream, Streams } from 'pino-multi-stream';

export class Logger {
	static init(opts?: any): Middleware {
		const date: string = moment().format('YYYY-MM-DD');

		/**
		 * 默认打印在控制台，生成模式下打印在本地文件中
		 * 主要利用 res.on('(finish|error)', cb)
		 */
		let streams: Streams = [
			{ level: 'info', stream: process.stdout },
			{ level: 'error', stream: process.stderr }
		];

		/* istanbul ignore if */
		if (process.env.NODE_ENV === 'production') {
			const logDir: string = path.join(__dirname, '../../logs');
			if (!fs.existsSync(logDir)) mkdirp.sync(logDir); // eslint-disable-line

			streams = [
				{ level: 'info', stream: fs.createWriteStream(`logs/${date}-info.log`) }, // eslint-disable-line
				{ level: 'error', stream: fs.createWriteStream(`logs/${date}-error.log`) } // eslint-disable-line
			];
		}

		let pinoOptions: Options = {
			name: 'NODE_ENV',
			level: process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'info',

			/**
			 * ignore目前需要全匹配，带后续修复
			 * https://github.com/pinojs/pino-http/pull/100
			 */
			// autoLogging: {
			// 	ignorePaths: [],
			// },

			// 格式化输出
			prettyPrint: {
				crlf: process.env.NODE_ENV !== 'production',
			},
			
			genReqId: req => req.headers['x-request-id'] || uuid.v4()
		};

		return pinoLogger(pinoOptions, multistream(streams));
	}
}
