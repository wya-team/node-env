import { Config } from './types';

const defaultConfig: Config = {
	port: 7300,
	host: "0.0.0.0",
	db: {
		/**
		 * 如果需要配置集群：
		 * mongodb://127.0.0.100:8418,127.0.0.101:8418,127.0.0.102:8418/wapi?slaveOk=true
		 */
		url: 'mongodb://127.0.0.1:27017/wapi',
		user: 'wapi-admin',
		pass: '123456'
	},
	jwt: {
		expire: "14 days",
		secret: "shared-secret"
	},
	blackList: {
		projects: [],
		ips: []
	},
	upload: {
		types: ['.jpg', '.jpeg', '.png', '.gif', '.json', '.yml', '.yaml'],
		size: 5242880,
		dir: "../public/upload",
		expire: {
			types: [".json", ".yml", ".yaml"],
			day: -1
		}
	},
	// koa-bodyparser
	bodyParser: {
		jsonLimit: '2mb', 
		formLimit: '1mb', 
		textLimit: '1mb' 
	}
};

export default defaultConfig;