const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const config = require('config');
const moment = require('moment');
const mkdirp = require('mkdirp');

const crypto = require('crypto');
const { Utils } = require('../utils');
const { AvatarProxy } = require('../proxy');

const uploadConf = config.get('upload');

class UtilController {

	/**
	 * 上传用户头像
	 * @interface /user/upload_avatar
	 */
	static async uploadAvatar(ctx) {
		try {
			let { basecode } = ctx.request.body;
			if (!basecode) {
				return ctx.body = Utils.refail({ msg: "basecode不能为空" });
			}

			let pngPrefix = 'data:image/png;base64,';
			let jpegPrefix = 'data:image/jpeg;base64,';
			let type;

			if (basecode.substr(0, pngPrefix.length) === pngPrefix) {
				basecode = basecode.substr(pngPrefix.length);
				type = 'image/png';
			} else if (basecode.substr(0, jpegPrefix.length) === jpegPrefix) {
				basecode = basecode.substr(jpegPrefix.length);
				type = 'image/jpeg';
			} else {
				return ctx.body = Utils.refail({ msg: "仅支持jpeg和png格式的图片" });
			}
			let { length } = basecode;

			if (parseInt(length - (length / 8) * 2, 10) > 200000) {
				return ctx.body = Utils.refail({ msg: "图片大小不能超过200kb" });
			}

			let result = await AvatarProxy.up(ctx.state.user.id, basecode, type);

			ctx.body = Utils.resuccess({ data: result });

		} catch (e) {
			ctx.body = Utils.refail({ msg: e.message });
		}
	}

	/**
	 * 根据用户uid头像
	 * @interface /user/avatar
	 */
	static async avatar(ctx) {
		try {
			let uid = ctx.query.uid || ctx.state.user.id;
			let { basecode, type = 'image/png' } = await AvatarProxy.get(uid) || {};

			// TODO: 移除默认图，改用url
			let dataBuffer = !basecode 
				? fs.readFileSync(path.join('static/image/avatar.png'))  // eslint-disable-line
				: Buffer.from(data.basecode, 'base64');

			ctx.set('Content-type', type);
			ctx.body = dataBuffer;
		} catch (err) {
			ctx.body = 'error:' + err.message;
		}
	}

	/**
	 * 文件上传
	 * @param Object ctx
	 */
	static async upload(ctx) {
		const { origin } = ctx.request;
		const expireDay = uploadConf.expire.day;
		const hash = crypto.createHash('md5');
		const date = moment().format('YYYY/MM/DD');
		const uploadDir = path.resolve(__dirname, '../../config', uploadConf.dir, date);

		const { file } = ctx.request.files;
		const suffix = path.extname(file.name).toLowerCase();
		const now = (new Date()).getTime();
		const fileName = hash.update(now + Math.random().toString()).digest('hex') + suffix;

		let reader;
		let stream;

		/* istanbul ignore if */
		if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir); // eslint-disable-line

		if (uploadConf.types.indexOf(suffix) === -1) {
			ctx.body = Utils.refail({
				msg: `上传失败，仅支持 ${uploadConf.types.join('/').replace(/\./g, '')} 文件类型`
			});
			return;
		}

		if (file.size > uploadConf.size) {
			ctx.body = Utils.refail({
				msg: '上传失败，超过限定大小'
			});
			return;
		}

		reader = fs.createReadStream(file.path);  // eslint-disable-line
		stream = fs.createWriteStream(path.join(uploadDir, fileName));  // eslint-disable-line
		reader.pipe(stream);

		ctx.body = Utils.resuccess({
			data: {
				path: new URL(path.join('upload', date, fileName), origin).href,
				expire: expireDay > 0
					? moment().add(expireDay, 'days').format('YYYY-MM-DD 00:00:00')
					: /* istanbul ignore next */ -1
			}
		});
	}
}

module.exports = {
	prefix: '/util',
	controller: UtilController,
	routes: [
		'POST /upload',
		'POST /upload-avatar',
		'GET /avatar'
	]
};
