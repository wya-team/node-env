/**
 * You can link multiple databases here.
 * Refer to: https://github.com/typeorm/typeorm/blob/master/docs/connection-options.md
 *
 *
 */
const config = require('config'); // eslint-disable-line

module.exports = {
	type: 'mongodb',
	host: config.get('db.host'),
	port: config.get('db.port'),
	username: config.get('db.username'),
	password: config.get('db.password'),
	database: config.get('db.database'),
	useNewUrlParser: true,
	useUnifiedTopology: true,
};
