const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const $Proxy = require('../proxy');

class TestController {
	static async list(ctx) {
		ctx.body = {
			status: 1,
			data: {}
		};
	}

	static async error(ctx) {
		ctx.body = {
			status: 0,
			data: {}
		};
	}

	static async success(ctx) {
		ctx.body = {
			status: 1,
			data: {}
		};
	}
}

module.exports = {
	prefix: '/test',
	controller: TestController,
	routes: [
		'GET /list',
		'GET /error',
		'GET /success',

		'PUT /list',
		'PUT /error',
		'PUT /success',

		'DELETE /list',
		'DELETE /error',
		'DELETE /success',
		
		'POST /list',
		'POST /error',
		'POST /success'
	]
};
