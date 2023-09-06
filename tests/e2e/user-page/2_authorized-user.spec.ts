import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/metamask.js';
import { UserPage } from '../../pageObjects/UserPage/UserPage.js';
import { getTestUserShortId } from '../../lib/utils/common.js';

test.use({
	connected: true,
});

test.describe('Authorized user on User page', () => {
	let page: Page;
	let userPage: UserPage;

	test.beforeAll(async ({ globalContext }) => {
		page = await globalContext.newPage();
		userPage = new UserPage(page);
		await userPage.goto();
	});

	test('Test user ID is displayed', async () => {
		await expect(userPage.userId).toContainText(getTestUserShortId());
	});

	//  TODO Check test user data
});
