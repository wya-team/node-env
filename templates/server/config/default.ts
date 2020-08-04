import { Config } from './types';

const defaultConfig: Config = {
	port: 7300,
	host: "0.0.0.0",
	db: {
		host: '127.0.0.1',
		port: 27017,
		username: 'repo-admin',
		password: '123456',
		database: 'repo'
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