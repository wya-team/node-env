const fs = require('fs');
const path = require('path');
const config = require('config');
const moment = require('moment');
const app = require('../../app');
const spt = require('../support');

describe('util.test.js', () => {
	let $;
	let $pure;
	let user;

	afterAll(() => spt.cleanCollections());
	beforeAll(async () => {
		user = await spt.createUser();
		$ = spt.createRequest(app.listen(), user.token);
		$pure = spt.createPureRequest(app.listen());
	});

	describe('upload', () => {
		const uploadConf = config.get('upload');
		const url = '/api/util/upload';

		test('文件类型错误', async () => {
			const res = await $.post(url)
				.field('name', 'my')
				.attach('file', Buffer.from('upload'), { filename: 'upload.js' });

			expect(res.body.msg).toBe(`上传失败，仅支持 ${uploadConf.types.join('/').replace(/\./g, '')} 文件类型`);
		});

		test('大小限制', async () => {
			const res = await $.post(url)
				.attach('file', Buffer.alloc(uploadConf.size + 1), 'upload.jpg');

			expect(res.body.msg).toBe('上传失败，超过限定大小');
		});

		test('图片上传', async () => {
			const res = await $.post(url)
				.attach('file', Buffer.from('upload'), 'upload.jpg');

			const data = res.body.data;
			const filePath = path.resolve(__dirname, '../../config', uploadConf.dir, data.path.match(/\/upload\/(.*)/)[1]);

			expect(data.expire).toBe(moment().add(uploadConf.expire.day, 'days').format('YYYY-MM-DD 00:00:00'));
			expect(res.body.msg).toBe('success');
			expect(fs.existsSync(filePath)).toBe(true); // eslint-disable-line
		});
	});
});
