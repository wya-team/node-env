import request from 'supertest';
import { Support } from '../support';

describe('routers: test', () => {
	beforeAll(async (done) => {
		await Support.ready();
		done();
	});

	afterAll(async done => {
		await Support.clean();
		done();
	});

	it('basic', async () => {
		expect(1).toEqual(1);
		let user = await Support.createUser();
	});
});
