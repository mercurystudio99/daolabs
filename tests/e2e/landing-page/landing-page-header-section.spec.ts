import { expect, test } from '@playwright/test';

test.describe('Landing page header', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test.afterEach(async ({ page }) => {
		await page.close();
	});

	test('Exists h1 text', ({ page }) => {
		const h1 = page
			.locator('h1')
			.getByRole('heading', { name: 'Fund anything. Grow together.' })
			.first();
		expect(h1).toBeDefined();
	});

	test('Exists description', async ({ page }) => {
		const description = page.locator('.slides > article > .description-wrapper').first();
		expect(description).toBeDefined();
		await expect(description).toHaveText(
			/The Decentralized Funding Platform. Light enough for a group of friends, powerful enough for a global network of anons. Community-owned,on Ethereum. on Ethereum./,
		);
	});

	test('Exists button "Launch your project"', async ({ page }) => {
		const button = page
			.locator('.slides > article > .button-wrapper > .linkButton > button')
			.first();
		expect(button).toBeDefined();
		await expect(button).toHaveClass(/lg primary fullWidth svelte-*/);
		await expect(button).toHaveText(/Launch your project/);
	});

	test('Exists button "Create tokens"', async ({ page }) => {
		const button = page
			.locator('.slides > article > .button-wrapper > .linkButton > button')
			.nth(1);
		expect(button).toBeDefined();
		await expect(button).toHaveClass(/lg secondary fullWidth svelte-*/);
		await expect(button).toHaveText(/Create Tokens/);
	});
});
