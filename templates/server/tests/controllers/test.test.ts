import { Support, RequestMethod } from '../support';

describe('routers: test', () => {
	let $: RequestMethod;
	let $pure: RequestMethod;
	let user: any;
	beforeAll(async (done) => {
		let { db, app } = await Support.ready();

		user = await Support.createUser();
		$ = await Support.createRequest(app.listen(), user.token);
		$pure = await Support.createPureRequest(app.listen());

		done();
	});

	afterAll(async done => {
		await Support.clean();
		done();
	});

	describe('basic', () => {
		test('---', async () => {
			expect(1).toEqual(1);
		});
	});
});
