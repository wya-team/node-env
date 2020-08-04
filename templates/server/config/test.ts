import { Config } from './types';

const testConfig: Config = {
	"db": {
		"host": "127.0.0.1",
		"port": 27017,
		"username": "test-repo-admin",
		"password": "123456",
		"database": "test-repo"
	},
	"blackList": {
		"ips": [
			"127.0.0.1"
		]
	},
	"upload": {
		"dir": "../public/upload/test",
		"expire": {
			"types": [
				".json",
				".jpg"
			],
			"day": 0.1
		}
	}
};

 export default testConfig;