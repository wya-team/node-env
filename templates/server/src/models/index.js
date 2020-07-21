const mongoose = require('mongoose');
const config = require('config');

const dbConfig = config.get('db');
const IS_ENV_TEST = process.env.NODE_ENV === 'test';

// http://mongoosejs.net/docs/connections.html
const options = {
	useCreateIndex: true,
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useFindAndModify: false,
	poolSize: 20,
	// 单独控制索引
	autoIndex: false
};

if (dbConfig.user) {
	options.user = dbConfig.user;
	options.pass = dbConfig.pass;
}

mongoose.Promise = global.Promise;

const db = mongoose.connect(dbConfig.url, options, (err) => {
	/* istanbul ignore if */
	if (err) {
		console.error('connect to %s authentication failed: ', dbConfig.url, err.message);
		process.exit(1);
	}
});

db.then(() => {
	!IS_ENV_TEST && console.log('connect to %s success!', dbConfig.url);
}).catch(() => {
	console.error('connect to %s error: ', dbConfig.url, err.message);
	// process.exit(1);
});

module.exports = {
	Avatar: require('./avatar'),
	User: require('./user'),
};

// 引用注入
module.exports.db = db;
