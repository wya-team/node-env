import bodyParser from 'koa-bodyparser';
/**
 * 数据库相关配置
 */
interface DBConfig {
    url?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string
}

/**
 * json web token 配置
 */
export interface JWT {
    expire?: string;
    secret?: string;
}

/**
 * 访问黑名单
 */
export interface BlackList {
    projects?: string[];
    ips?: string[];
}

export interface UploadExpire {
	types?: string[];
	day?: number;
}
/**
 * 上传控制
 */
export interface Upload {
    types?: string[];
    size?: number;
    dir?: string;
    expire?: UploadExpire;
}

/**
 * 配置项
 */
export interface Config {
	port?: number;
	host?: string;
	db?: DBConfig;
	jwt?: JWT;
    blackList?: BlackList;
	upload?: Upload;
    // koa
    bodyParser?: bodyParser.Options;
}