import supertest from 'supertest';
import testFn from 'firebase-functions-test';

import { app } from '../../../src/index';
const testApiKey = 'test-api-key';

describe('Location', () => {
	const { cleanup } = testFn();

	let request;

	beforeAll(() => {
		request = supertest(app);
	});

	afterAll(() => {
		cleanup();
	});

	it('should be return header values', async () => {
		const obj = {
			country: 'USA',
			region: 'CA',
			city: 'TT',
			cityLatLong: '0, 0',
			userIP: '127.0.0.1',
		};

		const { status, body } = await request.get('/location/country')
			.set('apiKey', testApiKey)
			.set('x-appengine-country', 'USA')
			.set('x-appengine-region', 'CA')
			.set('x-appengine-city', 'TT')
			.set('x-appengine-citylatlong', [0.0, 0.0])
			.set('x-appengine-user-ip', '127.0.0.1');

		expect(status).toEqual(200);	
		expect(body).toMatchObject(obj);
		
	});
});
