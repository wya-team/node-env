import path from 'path';
import rimraf from 'rimraf';
import config from 'config';
import moment from 'moment';
import _ from 'lodash';
import { Upload } from '../../config/types';

export class Clean {
	static init(): void {
		this.dropFileSchedule();
	}

	/**
	 * 定时删除已经上传的过期文件
	 * 如路径：/wapi/public/upload/test/2020/05/14/{*.json,*.jpg}  
	 * TODO: 删除昨天的资源
	 */
	static dropFileSchedule(): void {
		const conf: Upload = config.get('upload');
		const expireDay: number = conf.expire.day;

		/* istanbul ignore else */
		if (typeof expireDay === 'number' && expireDay > 0) {
			const expireTypes: string = conf.expire.types.map(type => `*${type}`).join(',');
			const date: string = moment().subtract(expireDay, 'days').format('YYYY/MM/DD');
			const uploadDir: string = path.resolve(__dirname, '../../config', conf.dir, date);
			const commandPath = `${uploadDir}/{${expireTypes}}`;

			rimraf(commandPath, _.noop);
			setInterval(() => rimraf(commandPath, _.noop), 1000 * 60 * 60);
		}
	}

	/**
	 * 删除日志资源
	 */
	static dropLogSchedule(): void {

	}
}