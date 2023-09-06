import supertest from 'supertest';
import testFn from 'firebase-functions-test';

import { app } from '../../../src/index';

describe('Render', () => {
	const { cleanup } = testFn();

	let request;

	beforeAll(() => {
		request = supertest(app);
	});

	afterAll(() => {
		cleanup();
	});

	it('should be', () => {});
});
