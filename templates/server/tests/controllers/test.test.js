const app = require('../../app');
const spt = require('../support');

describe('__.test.js', () => {
	let request;
	let user;

	afterAll(() => spt.cleanCollections());
	beforeAll(async () => {
		// TODO
	});

	test('参数验证', () => {
		expect(!!1).toBe(true);
	});
});
