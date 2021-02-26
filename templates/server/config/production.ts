import { Config } from './types';

const defaultConfig: Config = {
	port: process.env.NODE_PORT || 7301
};

export default defaultConfig;
