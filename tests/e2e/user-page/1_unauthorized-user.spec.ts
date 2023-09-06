import { test, expect, Page } from '@playwright/test';
import { UserPage } from '../../pageObjects/UserPage/UserPage.js';

test.describe('Unauthorized user on User page', () => {
	let page: Page;
	let userPage: UserPage;

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage();
		userPage = new UserPage(page);
		await userPage.goto();
	});

	test('Default user is on user page', async () => {
		expect(await userPage.userId.textContent()).toMatchSnapshot(['default-user-info']);
	});

	test('Deafult user sees 0 Collections button', async () => {
		await expect(userPage.collectionsButton).toHaveText('0 COLLECTIONS');
	});

	test.describe('Assets tab', () => {
		test('Tokens tab: Tokens balance is 0', async () => {
			expect(await userPage.tokensBalance.textContent()).toBe(' Ξ 0');
		});

		test('Tokens tab: Tokens performance is not 0', async () => {
			await expect(userPage.tokensPerformance).not.toContainText('0.00% ($0.00)');
		});

		test('Tokens tab: Assets are 0', async () => {
			await expect(userPage.assetsOther).toContainText('$0.00 0.00%');
		});

		test('Tokens tab: Tokens table contains placeholder', async () => {
			await expect(userPage.tokensTable).toContainText('No tokens found.');
		});

		test('Tokens tab: Transactions table contains placeholder', async () => {
			await expect(userPage.transactionsTable).toContainText('No transactions to show.');
		});

		test('NFT tab: Total value is 0', async () => {
			await userPage.nftTab.click();
			await expect(userPage.totalFloorPrice).toHaveText('Ξ 0');
		});
	});

	test.describe('Collections tab', () => {
		test.beforeAll(async () => {
			await userPage.collectionsButton.click();
		});

		test('Example card is displayed', async () => {
			await expect(userPage.exampleCollectionCard).toHaveCount(1);
		});

		test('Placeholder is displayed', async () => {
			await expect(userPage.collectionsExampleFooter).toHaveText(
				"This user hasn't created any collection yet.",
			);
		});
	});

	test.describe('Revenue Split tab', () => {
		test.beforeAll(async () => {
			await userPage.revenueSplitButton.click();
		});

		test('Example card is displayed', async () => {
			await expect(userPage.exampleRevenueSplitCard).toHaveCount(1);
		});

		test('Placeholder is displayed', async () => {
			await expect(userPage.revenueSplitFooter).toHaveText(
				"You haven't created any revenue split yet.",
			);
		});
	});

	test.describe('Juiceboxes tab', () => {
		test.beforeAll(async () => {
			await userPage.juiceboxesButton.click();
		});

		test('Example card is displayed', async () => {
			await expect(userPage.exampleJuiceboxCard).toHaveCount(1);
		});

		test('Placeholder is displayed', async () => {
			await expect(userPage.juiceboxesFooter).toHaveText(
				"This user hasn't created any project yet.",
			);
		});
	});
});
