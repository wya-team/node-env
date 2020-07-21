const fs = require('fs');
const path = require('path');

const config = {
	db: {
		url: 'mongodb://127.0.0.1:27017/test-repo',
		user: 'test-repo-admin',
		pass: '123456'
	},
	blackList: {
		ips: ['127.0.0.1']
	},
	upload: {
		dir: '../public/upload/test',
		expire: {
			types: ['.json', '.jpg'],
			day: 0.1
		}
	}
};

fs.writeFileSync(path.resolve(__dirname, '../config/test.js'), `module.exports = ${JSON.stringify(config, null, "\t")};`); // eslint-disable-line
