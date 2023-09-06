import { test, expect } from '@playwright/test';
import { CreateProjectPage } from '../../pageObjects/CreateProjectPage.js';
import { Header } from '../../pageObjects/Header.js';
import { LandingPage } from '../../pageObjects/LandingPage.js';
import { UserPage } from '../../pageObjects/UserPage/UserPage.js';

let landingPage: LandingPage;

test.describe('Unauthorized user on landing page', () => {
	test.beforeEach(async ({ page }) => {
		landingPage = new LandingPage(page);
		await landingPage.goto();
	});

	test('Default wallets are displayed in Available Wallets popup', async () => {
		const header = new Header(landingPage.page);
		await header.connectButton.click();
		for (const wallet of header.defaultWallets) {
			await expect(wallet).toHaveCount(1);
		}
	});

	test('Launch your project button leads to Create project page', async ({ page }) => {
		const createProjectPage = new CreateProjectPage(page);
		await landingPage.launchYourProjectButton.click();
		await page.waitForURL('/create');
		expect(await createProjectPage.pageHeader.textContent()).toBe('Design your project 🎨');
	});

	test('Start raising funds button leads to Create project page', async ({ page }) => {
		const createProjectPage = new CreateProjectPage(page);
		await landingPage.startRaisingFundsButton.click();
		await page.waitForURL('/create');
		expect(await createProjectPage.pageHeader.textContent()).toBe('Design your project 🎨');
	});

	test('Design your project button leads to Create project page', async ({ page }) => {
		const createProjectPage = new CreateProjectPage(page);
		await landingPage.designYourProgectButton.click();
		await page.waitForURL('/create');
		expect(await createProjectPage.pageHeader.textContent()).toBe('Design your project 🎨');
	});

	test('Create tokens buttons leads to User page', async ({ page }) => {
		await landingPage.createTokensButton.click();
		await page.waitForURL('/user');
		const userPage = new UserPage(page);
		await expect(userPage.userId).toBeVisible();
	});
});
