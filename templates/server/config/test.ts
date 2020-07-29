import { Config } from './types';

const testConfig: Config = {
	db: {
		url: "mongodb://127.0.0.1:27017/test-wapi",
		user: "test-wapi-admin",
		pass: "123456"
	},
	blackList: {
		"ips": [
			"127.0.0.1"
		]
	},
	upload: {
		dir: "../public/upload/test",
		expire: {
			types: [
				".json",
				".jpg"
			],
			day: 0.1
		}
	}
};


export default testConfig;