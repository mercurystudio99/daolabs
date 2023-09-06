import supertest from 'supertest';
import testFn from 'firebase-functions-test';

import { app } from '../../../src/index';

describe('Api keys', () => {
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
