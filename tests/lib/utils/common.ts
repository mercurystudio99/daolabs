import fs from 'fs';
import { BrowserContext, Locator, Page } from '@playwright/test';
import { Metamask } from '../../pageObjects/Metamask.js';
import { LandingPage } from '../../pageObjects/LandingPage.js';
import { Header } from '../../pageObjects/Header.js';

export function deleteFolder(path: string) {
	if (fs.existsSync(path)) {
		fs.rmdir(path, { recursive: true }, (err) => {
			if (err) {
				console.error(err);
			}
		});
	}
}

export async function connectMetamask(context: BrowserContext) {
	await context.grantPermissions(['notifications']);
	const metamaskPage = new Metamask(await context.newPage());
	await metamaskPage.goto();
	await metamaskPage.authToWallet();
	const landingPage = new LandingPage(await context.newPage());
	await landingPage.goto();
	const header = new Header(landingPage.page);
	await header.clickConnectButton();
	const [loginPage] = await Promise.all([
		context.waitForEvent('page'),
		header.metamaskButton.click(),
	]);
	await loginPage.waitForLoadState();
	const metamaskLoginPage = new Metamask(loginPage);
	await metamaskLoginPage.nextButton.click();
	const [signPage] = await Promise.all([
		context.waitForEvent('page'),
		metamaskLoginPage.connectButton.click(),
	]);
	// Commented until rework
	// const metamaskSignPage = new Metamask(signPage);
	// await metamaskSignPage.signButton.click();
}

const getUserShortId = (userId: string) =>
	`${userId.slice(0, 6)}...${userId.slice(-6)}`.toLowerCase();

export const getTestUserShortId = () => getUserShortId(process.env.METAMASK_TEST_ACCOUNT);

export async function elementExists(locator: Locator, timeout = 1_000) {
	try {
		await locator.waitFor({ state: 'attached', timeout });
		return true;
	} catch {
		return false;
	}
}

export function addDays(daysFromToday: number) {
	const result = new Date();
	result.setDate(result.getDate() + daysFromToday);
	return result;
}

export function getOffsetDate(daysFromToday: number) {
	const date = addDays(daysFromToday);
	const day = date.getDate();
	const month = date.getMonth() + 1;
	return `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${day
		.toString()
		.padStart(2, '0')}`;
}

export async function selectFile(page: Page, uploadFileZone: Locator, path: string) {
	const [fileChooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		uploadFileZone.click(),
	]);
	await fileChooser.setFiles(path);
	await uploadFileZone.waitFor({ state: 'detached' });
}

export function formatNumer(num: number) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export async function clearAndFillInput(input: Locator, text: string) {
	await input.clear();
	await input.fill(text);
}
