import request from 'supertest';
import { Support } from '../support';

describe('routers: session', () => {
	beforeAll(async () => {
		// TODO
	});

	afterAll(async done => {
		Support.cleanCollections();
		done();
	});

	it('test', async () => {
		expect(1).toEqual(1);
	});
});
