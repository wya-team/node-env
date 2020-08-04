import fs from 'fs';
import path from 'path';
import { Config } from '../config/types';

const config: Config = {
	db: {
		host: '127.0.0.1',
		port: 27017,
		username: 'test-repo-admin',
		password: '123456',
		database: 'test-repo'
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

fs.writeFileSync(
	path.resolve(__dirname, '../config/test.ts'), 
	`import { Config } from './types';\n\nconst testConfig: Config = ${JSON.stringify(config, null, "\t")};\n\n export default testConfig;`
); // eslint-disable-line
